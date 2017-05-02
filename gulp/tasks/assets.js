var gulp = require('gulp')
var path = require('path')
var bs = require('browser-sync')

var consts = require('../const')

module.exports = function () {
  gulp.src(consts.ENTRIES.assets)
    .pipe(gulp.dest(consts.DIST_PATH))
    .pipe(bs.reload({ stream: true }))
}
