'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

// Lint JavaScript
gulp.task('lint', function() {
  return gulp.src([
      'index.js',
      'test/test.js'
    ])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
});