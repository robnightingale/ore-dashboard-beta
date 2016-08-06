'use strict';

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create();

var DEST = 'public/';

gulp.task('scripts', function() {
    return gulp.src([
        'src/js/helpers/*.js',
        'src/js/*.js',
      ])
      .pipe(concat('custom.js'))
      .pipe(gulp.dest(DEST+'/js'))
      .pipe(rename({suffix: '.min'}))
      .pipe(uglify())
      .pipe(gulp.dest(DEST+'/js'))
      .pipe(browserSync.stream());
});

// TODO: Maybe we can simplify how sass compile the minify and unminify version
var compileSASS = function (filename, options) {
  return sass('src/scss/*.scss', options)
        .pipe(autoprefixer('last 2 versions', '> 5%'))
        .pipe(concat(filename))
        .pipe(gulp.dest(DEST+'/css'))
        .pipe(browserSync.stream());
};

gulp.task('sass', function() {
    return compileSASS('custom.css', {});
});

gulp.task('sass-minify', function() {
    return compileSASS('custom.min.css', {style: 'compressed'});
});

gulp.task('watch', function() {
  // Watch .html files
  gulp.watch('public/*.html', browserSync.reload);
  gulp.watch('public/**/js/*.js', browserSync.reload);
  // Watch .js files
  gulp.watch('src/js/*.js', ['scripts']);
  // Watch .scss files
  gulp.watch('src/scss/*.scss', ['sass', 'sass-minify']);
});

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: ['./','public'],
            port:process.env.PORT || 3000
        },
        injectChanges: 'true'
        // ,startPath: './public/index.html',
        // ,browser : 'google chrome'
    });
});


gulp.task('serveprod', function() {
    connect.server({
        root: ['./', 'public'],
        port: process.env.PORT || 5000, // localhost:5000
        livereload: false
        // ,fallback : './public/index.html'
    });
});

// Default Task
gulp.task('dev', ['browser-sync', 'watch']);
gulp.task('default', ['serveprod', 'watch']);
