/*
 * gulp-stubby
 * https://github.com/felixzapata/gulp-pug-i18n
 *
 * Copyright (c) 2016 Felix Zapata
 * Licensed under the MIT license.
 */

'use strict';

var gulp = require('gulp'),
    pugI18n = require('./index.js'),
    clean = require('del'),
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

gulp.task('pugI18n', function() {

    var translateDir = {
            i18n: {
                locales: 'test/locales/*.json'
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
        .pipe(gulp.dest('./dist/'));

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


gulp.task('test', ['default', 'pugI18n', 'nodeunit']);

gulp.task('default', ['clean', 'test']);
