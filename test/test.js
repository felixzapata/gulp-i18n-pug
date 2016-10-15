'use strict';

var pugI18n = require('../index');
var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');
require('mocha');

var fixtures = function (glob) { return path.join(__dirname, './fixtures', glob); }

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

describe('gulp-pug-i18n', function () {

	beforeEach(function (done) {
    var folder = path.join(__dirname, 'temp');
    fs.remove(folder, done);
	});

	describe('Translate file', function () {

		it('should translate the template into english', function (done) {
			var options = {
				urls: [fixtures('working.html')]
			};
			gulp.src(fixtures('working.html'))
				.pipe(pugI18n(options))
        .pipe(sassert.end(function () {
          done();
        }));

		});

    xit('should translate the template into spanish', function (done) {
		});
	});

  xdescribe('Translate directory', function () { 
    it('should translate the template into english', function (done) { 

    });
    it('should translate the template into spanish', function (done) { 

    });
  });

  xdescribe('Without i18n', function() {
    it('should generate the template without i18n task options', function() {

    });
  });
});