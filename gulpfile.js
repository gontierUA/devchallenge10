/*globals require*/

var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var watch = require('gulp-watch');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');

var path = {
    build: {
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/'
    },
    src: {
        js: 'js/*.js',
        style: 'css/app.scss'
    },
    watch: {
        js: 'js/*.js',
        style: 'css/app.scss'
    },
    clean: './build'
};

gulp.task('style:build', function() {
    gulp.src(path.src.style)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css));
});

gulp.task('scripts:build', function() {
    return gulp.src([
            '!js/*.test.js',
            'js/libs/*.js',
            'js/global.js',
            'js/*.js',
        path.src.js
    ])
        .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js));
});

gulp.task('webserver:run', function() {
    browserSync({
        server: {
            baseDir: './'
        }
    });
});

gulp.task('watch', function() {
    watch([path.watch.style], function() {
        gulp.start('style:build');
    });

    watch([path.watch.js], function() {
        gulp.start('scripts:build');
    });
});

gulp.task('default', ['style:build', 'scripts:build',  'watch']);
