'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var conventionalChangelog = require('conventional-changelog');
var fs = require('fs');
var file = 'CHANGELOG.md';

gulp.task('changelog', function (done) {

  fs.readFile('./package.json', 'utf8', function (err, rawData) {
    var buffer = [];
    var stream = conventionalChangelog({
      preset: 'angular',
      host: 'github',
    }, { linkReferences: true });

    stream.on('end', function () {
      var contentToWrite = Buffer.concat(buffer);

      function create() {
        var oldChangelog = fs.readFileSync(file);
        var fd = fs.openSync(file, 'w+');
        fs.writeSync(fd, contentToWrite, 0, contentToWrite.length);
        fs.writeSync(fd, oldChangelog, 0, oldChangelog.length);
        fs.close(fd);
      }

      function update() {
        fs.writeFile(file, contentToWrite);
      }

      function existFile() {
        return fs.existsSync(file);
      }

      if (existFile()) {
        create();
      } else {
        update();
      }
      done();
    });

    stream.on('data', function (data) {
      buffer.push(data);
    });

  });
});