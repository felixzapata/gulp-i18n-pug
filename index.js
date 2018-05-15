/*
 * gult-stubby
 * https://github.com/felixzapata/gulp-i18n-pug
 *
 * Copyright (c) 2016 Félix Zapata
 * Licensed under the MIT license.
 */


'use strict';

var pug = require('pug');
var glob = require('glob');
var fs = require('fs');
var gutil = require('gulp-util');
var path = require('path');
var YAML = require('js-yaml');
var through = require('through2');
var chalk = require('chalk');
var PLUGIN_NAME = 'gulp-i18n-pug';


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

    var dest
    var ext = getExtension(file);
    var localeLowerCase = locale.toLowerCase();

    function getBaseName() {
        return path.basename(file).split('.')[0];
    }

    if (ext) {
        dest = path.join(path.basename(file, ext) + '.' + localeLowerCase);
    } else {
        dest = path.join(getBaseName() + '.' + localeLowerCase);
    }

    dest += setExtension(outputExt);

    return dest;
}

function addLocaleDirnameDest(file, locale, outputExt) {
    var base;
    var dest;
    var ext = getExtension(file);
    if (ext) {
        dest = path.join(locale, path.dirname(file), path.basename(file, ext) + setExtension(ext));
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

function plugI18nPlugin(customOptions) {

    var baseName;
    var compiledFiles = [];
    var dest;
    var localePath;
    var fileExt;
    var locale;

    var defaultI18nOptions = {
        i18n: {
            namespace: '$i18n',
            localeExtension: false,
            defaultExt: '.html',
            verbose: false
        }
    }
    var options = Object.assign({}, customOptions);

    if (!options.i18n) {
        options.i18n = {};
    } else {
        options.i18n = Object.assign(defaultI18nOptions.i18n, customOptions.i18n);
    }

    var locales = options.i18n.locales ? glob.sync(options.i18n.locales) : null;

    var bufferContents = function (file, enc, cb) {

        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return;
        }

        if (locales && locales.length) {
            for (var i = 0, len = locales.length; i < len; i++) {
                localePath = locales[i];
                fileExt = localePath.split('.').slice(-1)[0];
                locale = path.basename(localePath, '.' + fileExt);
                baseName = path.basename(file.path);
                if (options.i18n.verbose) {
                    console.log(chalk.cyan('Loading locale ') + locale);
                    console.log(chalk.cyan('Reading translation data: ') + localePath);
                }
                if (!options.data) {
                    options.data = {};
                }
                options.data[options.i18n.namespace] = readFile(localePath);
                options.data['$localeName'] = locale;

                if (options.i18n.localeExtension) {
                    dest = addLocaleExtensionDest(baseName, locale, options.i18n.defaultExt);
                } else {
                    dest = addLocaleDirnameDest(file.relative, locale, options.i18n.defaultExt);
                }

                compiledFiles.push(new gutil.File({
                    base: options.i18n.dest,
                    contents: new Buffer(pug.compileFile(file.path, options)(options.data)),
                    path: path.join(options.i18n.dest, dest)
                }));

            }

        } else {
            console.log(chalk.red('Locales files not found. Nothing to translate'));
            compiledFiles.push(new gutil.File({
                base: __dirname,
                cwd: __dirname,
                contents: new Buffer(pug.compileFile(file.path, options)(options.data)),
                path: path.basename(file.path).split('.')[0] + options.i18n.defaultExt
            }));
        }
        cb();
    }

    var endStream = function (cb) {
        if (!compiledFiles || compiledFiles.length === 0) {
            cb();
            return;
        }
        for (var i = 0, len = compiledFiles.length; i < len; i++) {
            console.log(chalk.cyan('Created file: ') + compiledFiles[i].path);
            this.push(compiledFiles[i]);
        }
        cb();
    }

    return through.obj(bufferContents, endStream);
}

module.exports = plugI18nPlugin;
