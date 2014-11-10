/*
 * gulp-stubby
 * https://github.com/felixzapata/gulp-jade-i18n
 *
 * Copyright (c) 2014 Felix Zapata
 * Licensed under the MIT license.
 */

'use strict';

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jadeI18n = require('./index.js'),
    clean = require('gulp-clean'),
    nodeunit = require('gulp-nodeunit');


gulp.task('jshint', function() {
    gulp.src([
            '!gulpfile.js',
            '!test/*.js',
            'index.js'
        ])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter());
});

gulp.task('jadeI18n', function() {

    var translateDir = {
            i18n: {
                locales: 'test/locales/*'
            },
            pretty: true
        },
        translateFile = {

            i18n: {
                locales: ['test/locales/*'],
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

    gulp.src('test/fixtures/directory/*.jade')
        .pipe(jadeI18n(translateDir))
        .pipe(gulp.dest('.tmp/sample.jade'));

    // gulp.src('*.jade')
    //     .pipe(jadeI18n(translateFile))
    //     .pipe(gulp.dest('./dist/'));

    // gulp.src('test/fixtures/directory/*.jade')
    //     .pipe(jadeI18n(noI18n))
    //     .pipe(gulp.dest('.tmp/no-i18n.html'));

});

gulp.task('clean', function() {
    gulp.src('.tmp', {
            read: false
        })
        .pipe(clean());
});

gulp.task('nodeunit', function() {
    gulp.src('test/test.js').pipe(nodeunit());
});


gulp.task('test', ['default', 'jadeI18n', 'nodeunit']);

gulp.task('default', ['clean', 'jshint', 'test']);
