var gulp = require('gulp')
var babel = require('gulp-babel')
var scss = require('gulp-scss')
var autoprefixer = require('gulp-autoprefixer')

var paths = {
  scss: './src/*.scss',
  es6: './src/*.es6',
  app: './build'
}

gulp.task("scss", function () {
  return gulp.src(paths.scss)
    .pipe(scss())
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.app))
})

gulp.task('babel', function () {
  return gulp.src(paths.es6)
    .pipe(babel())
    .on('error', function(err) {
      console.log('Babel thrown an error>>>', err)

      this.emit('end')
    })
    .pipe(gulp.dest(paths.app))
})

gulp.task('watch', function() {
  gulp.watch(paths.es6, ['babel'])
  gulp.watch(paths.scss, ['scss'])
})

gulp.task('default', ['babel', 'scss', 'watch'])
