var gulp = require('gulp');

// Plugins
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var concat = require('gulp-concat');
var copy = require('gulp-copy');
var print = require('gulp-print');
var autoprefixer = require('gulp-autoprefixer');
var runSequence = require('run-sequence');

// Paths
var packagePath = '../';
var stylesPath = packagePath + 'Resources/Private/Styles';
var destPath = packagePath + 'Resources/Public/Styles';

gulp.task('sass', function (cb) {
    return gulp.src(stylesPath + '/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(destPath));
});

gulp.task('minify-css', function () {
    return gulp.src([
            destPath + '/accordeon.css',
            destPath + '/all.css',
        ])
        .pipe(autoprefixer())
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(destPath));
});

gulp.task('concatjs', function () {
    return gulp.src([
            packagePath + 'Resources/Private/Scripts/Accordeon.js'
        ])
        .pipe(concat('All.js'))
        .pipe(gulp.dest(packagePath + "Resources/Private/Scripts/"));
});

gulp.task('uglifyjs', function () {
    return gulp.src(packagePath + "Resources/Private/Scripts/*.js")
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(packagePath + "Resources/Public/Scripts/"));
});


gulp.task('compile-css', function () {
    runSequence('sass', 'minify-css');
});
gulp.task('compile-js', function () {
    runSequence('concatjs', 'uglifyjs')
});

gulp.task('compile', ['compile-css', 'compile-js']);
