/*
 * gult-stubby
 * https://github.com/felixzapata/gulp-pug-i18n
 *
 * Copyright (c) 2016 Félix Zapata
 * Licensed under the MIT license.
 */


'use strict';

var R = require('ramda');
var pug = require('pug');
var glob = require('glob');
var fs = require('fs');
var gutil = require('gulp-util');
var ext = require('gulp-util').replaceExtension;
var PluginError = require('gulp-util').PluginError;
var path = require('path');
var YAML = require('js-yaml');
var through = require('through2');
var PLUGIN_NAME = 'gulp-pug-i18n';


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

function addLocaleExtensionDest(obj, locale, outputExt) {

    var files = glob.sync(path.join(obj.cwd, obj.src));
    return _.map(files, function (file) {

        var dest, ext;

        locale = locale.toLowerCase();
        ext = getExtension(file);


        function getBaseName() {
            return path.basename(file).split('.')[0];
        }

        if (ext) {
            dest = path.join(obj.dest, path.basename(file, ext) + '.' + locale);
        } else {
            dest = path.join(obj.dest, getBaseName() + '.' + locale);
        }

        if (obj.ext) {
            dest += setExtension(obj.ext);
        } else {
            dest += setExtension(outputExt);
        }

        return dest;
    });
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
    dest = dest.replace(/\.pug$/i, setExtension(outputExt));
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

function plugI18nPlugin(options) {

    var defaultExt;
    var localeExtension; 
    var namespace;
    var filePath;
    var fileExt;
    var locale;

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

    var locales = glob.sync(options.i18n.locales);


    var bufferContents = function (file, enc, cb) {

        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            driver.quit();
            cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return;
        }

        if (locales && locales.length) {

            for(var i = 0, len = locales.length; i < len; i++) {
                filePath = locales[i];
                fileExt = filePath.split('.').slice(-1)[0];
                locale = path.basename(filePath, '.' + fileExt);
                gutil.log('Loading locale ' + locale);
                gutil.log('Reading translation data: ' + filePath);
                if (!options.data) {
                    options.data = {};
                }
                options.data[namespace] = readFile(filePath);
                //options.data.$localeName = locale;
                //fs.writeFileSync(dest, pug.compileFile(file.path, options)(options.data));
            }

        } else {
            gutil.log('Locales files not found. Nothing to translate');
        }

        cb();
    }

    var endStream = function (cb) {
        // this.push(joinedFile);
        cb();
    }

    return through.obj(bufferContents, endStream);
}

module.exports = plugI18nPlugin;
