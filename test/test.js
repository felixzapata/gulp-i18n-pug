'use strict';

var pugI18n = require('../index');
var path = require('path');
var fs = require('fs-extra');
var sassert = require('stream-assert');
var assert = require('assert');
var gulp = require('gulp');
require('mocha');

var fixtures = function (glob) { return path.join(__dirname, './fixtures', glob); }

describe('gulp-i18n-pug', function () {

  afterEach(function (done) {
    fs.remove('./.tmp', done);
  });

  describe('Translate directory:', function () {

    it('should translate the template into english', function (done) {
      var options = {
        i18n: {
          dest: '.tmp',
          locales: 'test/locales/*.*'
        },
        pretty: true
      };
      gulp.src(fixtures('directory/template.pug'))
        .pipe(pugI18n(options))
        .pipe(gulp.dest(options.i18n.dest))
        .pipe(sassert.end(function () {
          var expected = fs.readFileSync(path.join(__dirname, 'expected/en_US/sample.html')).toString();
          var actual = fs.readFileSync(path.join('./.tmp/en_US/template.html')).toString();
          assert.equal(actual, expected);
          done();
        }));

    });

    it('should translate the template into spanish', function (done) {

      var options = {
        i18n: {
          dest: '.tmp',
          locales: 'test/locales/*.*'
        },
        pretty: true
      };
      gulp.src(fixtures('directory/template.pug'))
        .pipe(pugI18n(options))
        .pipe(gulp.dest(options.i18n.dest))
        .pipe(sassert.end(function () {
          var expected = fs.readFileSync(path.join(__dirname, 'expected/es_ES/sample.html')).toString();
          var actual = fs.readFileSync(path.join('./.tmp/es_ES/template.html')).toString();
          assert.equal(actual, expected);
          done();
        }));

    });
  });

  describe('Translate file:', function () {
    it('should translate the template into english', function (done) {
      var options = {
        i18n: {
          dest: '.tmp',
          locales: 'test/locales/*.*',
          localeExtension: true
        },
        pretty: true
      };
      gulp.src(fixtures('directory/template.pug'))
        .pipe(pugI18n(options))
        .pipe(gulp.dest(options.i18n.dest))
        .pipe(sassert.end(function () {
          var expected = fs.readFileSync(path.join(__dirname, 'expected/template.en_us.html')).toString();
          var actual = fs.readFileSync(path.join('./.tmp/template.en_us.html')).toString();
          assert.equal(actual, expected);
          done();
        }));

    });
    it('should translate the template into spanish', function (done) {
      var options = {
        i18n: {
          dest: '.tmp',
          locales: 'test/locales/*.*',
          localeExtension: true
        },
        pretty: true
      };
      gulp.src(fixtures('directory/template.pug'))
        .pipe(pugI18n(options))
        .pipe(gulp.dest(options.i18n.dest))
        .pipe(sassert.end(function () {
          var expected = fs.readFileSync(path.join(__dirname, 'expected/template.es_es.html')).toString();
          var actual = fs.readFileSync(path.join('./.tmp/template.es_es.html')).toString();
          assert.equal(actual, expected);
          done();
        }));

    });
  });

  describe('Without i18n:', function () {
    it('should generate the template without i18n task options', function (done) {
      var options = {
        i18n: {
          dest: '.tmp'
        },
        data: {
          message: 'Hello world!',
          nested: {
            msg: 'and hello to you'
          }
        },
        pretty: true
      };
      gulp.src(fixtures('directory/template-noi18n.pug'))
        .pipe(pugI18n(options))
        .pipe(gulp.dest(options.i18n.dest))
        .pipe(sassert.end(function () {
          var expected = fs.readFileSync(path.join(__dirname, 'expected/template-noi18n.html')).toString();
          var actual = fs.readFileSync(path.join(__dirname, '../', '.tmp/template-noi18n.html')).toString();
          assert.equal(actual, expected);
          done();
        }));
    });
  });
});