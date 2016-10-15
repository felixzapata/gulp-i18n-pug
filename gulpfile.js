/*
 * gulp-stubby
 * https://github.com/felixzapata/gulp-pug-i18n
 *
 * Copyright (c) 2016 Felix Zapata
 * Licensed under the MIT license.
 */

'use strict';

var gulp = require('gulp');
var pugI18n = require('./index.js');
var del = require('del');
var nodeunit = require('gulp-nodeunit');


gulp.task('jshint', function () {
    gulp.src([
        '!gulpfile.js',
        '!test/*.js',
        'index.js'
    ])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter());
});

gulp.task('pugI18n', ['clean'], function () {

    var translateDir = {
        i18n: {
            dest: 'dist',
            locales: 'test/locales/*.*'
        },
        pretty: true
    },
        translateFile = {
            i18n: {
                locales: 'test/locales/*',
                namespace: '$t',
                localeExtension: true
            },
            client: false,
            pretty: true
        },

        noI18n = {

            data: {
                $i18n: {
                    message: 'Hello world!',
                    nested: {
                        msg: 'and hello to you'
                    }
                }
            },
            pretty: true

        };
    return gulp.src('test/fixtures/directory/*.pug')
        .pipe(pugI18n(translateDir))
        .pipe(gulp.dest(translateDir.i18n.dest));

});

gulp.task('clean', function () {
    return del(['./dist/']);
});

gulp.task('nodeunit', function () {
    gulp.src('test/test.js').pipe(nodeunit());
});


gulp.task('test', ['default', 'pugI18n', 'nodeunit']);

gulp.task('default', ['clean', 'test']);
