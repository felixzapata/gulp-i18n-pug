'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');

function done(error) {
  if (error) {
    $.util.log($.util.colors.red(error.message));
  } else {
    $.util.log($.util.colors.green('Release finished successfully'));
  }

}

gulp.task('release:major', function (cb) {
  runSequence('test', 'bump:major', 'changelog', 'git', done);
});

gulp.task('release:minor', function (cb) {
  runSequence('test', 'bump:minor', 'changelog', 'git', done);
});

gulp.task('release:patch', function () {
  runSequence('test', 'bump:patch', 'changelog', 'git', done);
});