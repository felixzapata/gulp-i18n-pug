/*
 * gult-stubby
 * https://github.com/felixzapata/gulp-jade-i18n
 *
 * Copyright (c) 2014 Félix Zapata
 * Licensed under the MIT license.
 */


'use strict';

var _ = require('lodash'),
    glob = require('glob'),
    fs = require('fs'),
    es = require('event-stream'),
    gutil = require('gulp-util'),
    compile = require('jade').compile,
    compileClient = require('jade').compileClient,
    ext = require('gulp-util').replaceExtension,
    PluginError = require('gulp-util').PluginError,
    path = require('path'),
    YAML = require('js-yaml'),
    PLUGIN_NAME = 'gulp-jade-i18n';


function handleCompile(contents, opts) {
    if (opts.client) {
        return compileClient(contents, opts);
    }
    return compile(contents, opts)(opts.locals || opts.data);
}

function handleExtension(filepath, opts) {
    if (opts.client) {
        return ext(filepath, '.js');
    }
    return ext(filepath, '.html');
}


function getExtension(filepath) {
    return path.extname(filepath);
}

function setExtension(ext) {
    if (ext.charAt(0) !== '.') {
        ext = '.' + ext;
    }
    return ext;
}

function readYAML(filepath, options) {
    var src = fs.readFileSync(filepath, options);
    var result;
    try {
        result = YAML.load(src);
        return result;
    } catch (e) {
        throw new gutil.PluginError(PLUGIN_NAME, 'Unable to parse "' + filepath + '" file (' + e.problem + ').', e);
    }
}

function readJSON(filepath, options) {
    var src = fs.readFileSync(filepath, options);
    var result;
    try {
        result = JSON.parse(src);
        return result;
    } catch (e) {
        throw new gutil.PluginError(PLUGIN_NAME, 'Unable to parse "' + filepath + '" file (' + e.message + ').', e);
    }
}

function addLocaleExtensionDest(file, locale, outputExt) {
    var dest, ext;
    locale = locale.toLowerCase();
    ext = getExtension(file.dest);

    function getBaseName() {
        return path.basename(file.src[0]).split('.')[0];
    }

    if (ext) {
        dest = path.join(path.dirname(file), path.basename(file, ext) + '.#{locale}');
    } else {
        dest = path.join(file, getBaseName() + '.#{locale}');
    }
    if (file.orig.ext) {
        dest += setExtension(file.orig.ext);
    } else {
        dest += setExtension(outputExt);
    }
    return dest;
}

function addLocaleDirnameDest(file, locale, outputExt) {
    var base, dest, ext = getExtension(file);
    if (ext) {
        dest = path.join(path.dirname(file), locale, path.basename(file, ext) + setExtension(ext));
    } else {
        if (/(\/|\*+)$/i.test(file)) {
            base = file.split('/');
            dest = path.join(path.join.apply(null, base.slice(0, -1)), locale, base.slice(-1)[0]);
        } else {
            dest = path.join(file, locale);
        }
    }
    dest = dest.replace(/\.jade$/i, setExtension(outputExt));
    return dest;
}

function readFile(filepath) {
    var data;
    try {
        if (/(\.yaml|\.yml)$/i.test(filepath)) {
            data = readYAML(filepath);
        } else if (/\.js$/i.test(filepath)) {
            data = require(path.resolve(filepath));
        } else {
            data = readJSON(filepath);
        }
    } catch (_error) {
        throw new gutil.PluginError("Cannot parse file '" + filepath + "': " + _error.message, _error);
    }
    return data;
}

function processJadeFiles(options) {

    var anotherTargetsForTask, defaultExt, gruntTaskName, jadeConfig, jadeOrigConfig, languageHasChanged, localeExtension, locales, namespace;
    jadeConfig = null;

    if (!options.i18n) {
        options.i18n = {};
    } else {
        locales = options.i18n.locales;
        namespace = options.i18n.namespace;
        localeExtension = options.i18n.localeExtension;
        defaultExt = options.i18n.defaultExt;
    }

    if (!namespace) {
        namespace = '$i18n';
    }

    if (!localeExtension) {
        localeExtension = false;
    }

    if (!defaultExt) {
        defaultExt = '.html';
    }



    if (locales && locales.length) {
        glob(locales, function(err, files) {
            files.forEach(function(filepath) {
                var config = {}, currentLanguage, fileExt, locale, opts, pathToStoredLanguage, storedLanguage;
                fileExt = filepath.split('.').slice(-1)[0];
                locale = path.basename(filepath, '.' + fileExt);
                gutil.log("Loading locale '" + locale + "'");
                gutil.log('Reading translation data: ' + filepath);
                if (typeof options.data === 'function') {
                    options.data = options.data() || {};
                }
                if (!_.isPlainObject(options.data)) {
                    options.data = {};
                }
                options.data = _.extend(options.data, readFile(filepath));
                options.data[namespace] = readFile(filepath);
                options.data.$localeName = locale;
                config.files = _.cloneDeep(options.files).map(function(file) {
                    if (localeExtension) {
                        addLocaleExtensionDest(file, locale, defaultExt);
                    } else {
                        addLocaleDirnameDest(file, locale, defaultExt);
                    }
                    return file;
                });
            });
        });

    } else {
        gutil.log('Locales files not found. Nothing to translate');
    }
}

function jadeI18nPlugin(customOptions) {


    var options = customOptions ||  {},
        child,
        stream,
        files = [];


    function CompileJade(file, enc, cb) {
        options.filename = file.path;
        if (file.data) {
            options.data = file.data;
        }
        file.path = handleExtension(file.path, options);
        if (file.isStream()) {
            return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }
        if (file.isBuffer()) {
            try {
                file.contents = new Buffer(handleCompile(String(file.contents), options));
            } catch (e) {
                return cb(new PluginError(PLUGIN_NAME, e));
            }
        }
        cb(null, file);
    }

    function done(code) {
        // Stop the server if it's running
        if (child) {
            child.kill();
        }
        // End the stream if it exists
        if (stream) {
            if (code) {
                stream.emit('error', new gutil.PluginError(PLUGIN_NAME, ' exited with code ' + code));
            } else {
                stream.emit('end');
            }
        }
    }


    function queueFile(file) {
        if (file) {
            files.push(file.path);
        } else {
            stream.emit('error', new Error('Got undefined file'));
        }
    }

    function endStream() {

        if (files.length) {
            options.files = files;
        }

        processJadeFiles(options);


    }

    stream = es.through(queueFile, endStream);
    return stream;
}


module.exports = jadeI18nPlugin;
