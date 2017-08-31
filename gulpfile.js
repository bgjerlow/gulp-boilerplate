var gulp = require('gulp'),
    gutil = require('gulp-util'),
    coffee = require('gulp-coffee'),
    concat = require('gulp-concat'),
    compass = require('gulp-compass'),
    connect = require('gulp-connect'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    jsonminify = require('gulp-jsonminify'),
    imagemin = require('gulp-imagemin'),
    pngcrush = require('imagemin-pngcrush');


var env,
    coffeeSources, 
    jsSources,
    sassSources,
    outputDir,
    sassStyle;


env = process.env.NODE_ENV || 'development'; // Change this to Development or Production before running gulp command to use Dev or Prod env


// Defining the environments
if (env==='development') {
    outputDir = 'builds/development/';
    sassStyle = 'expanded';
} else {
    outputDir = 'builds/production/';
    sassStyle = 'compressed';
}


// Add CoffeeScript sources below
coffeeSources = []


// Add JS sources below
jsSources = [];
// If using CoffeeScript, remember to define the compiled version of these files in jsSources!


// Add Sass sources below
sassSources = ['components/sass/style.scss'];


// Compile CoffeeScript to JS
gulp.task('coffee', function() {
    gulp.src(coffeeSources)
        .pipe(coffee({ bare: true })
             .on('error', gutil.log))
        .pipe(gulp.dest('components/scripts'))
});


// Concat JS files and reload gulp-connect server
gulp.task('js', function() {
    gulp.src(jsSources)
        .pipe(concat('script.js'))
        .pipe(gulpif(env === 'production', uglify()))
        .pipe(gulp.dest(outputDir + 'js'))
        .pipe(connect.reload())
});


// Compile Sass to CSS
gulp.task('compass', function() {
    gulp.src(sassSources)
        .pipe(compass({
            css: outputDir + 'css',
            sass: 'components/sass',
            image: outputDir + 'images',
            style: sassStyle
        })
    .on('error', gutil.log))
    .pipe(connect.reload())
});


// Watch for changes to JS, Sass, and HTML files
gulp.task('watch', function() {
    gulp.watch(coffeeSources, ['coffee']);
    gulp.watch(jsSources, ['js']);
    gulp.watch('components/sass/*.scss', ['compass']);
    gulp.watch('builds/development/*.html', ['html']);
    gulp.watch('builds/development/js/*.json', ['json']);
    gulp.watch('builds/development/images/**/*.*', ['images']);
});


// Start server with livereload enabled
gulp.task('connect', function() {
    connect.server({
        root: outputDir,
        livereload: true
    })
});


// Livereload when an HTML file is changed
gulp.task('html', function() {
    gulp.src('builds/development/*.html')
        .pipe(gulpif(env === 'production', minifyHTML()))
        .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
        .pipe(connect.reload())
});


// Compress images for Prod env - NOTE: This will make the server shut down after running in Prod when using it on Windows
gulp.task('images', function() {
    gulp.src('builds/development/images/**/*.*')
        .pipe(gulpif(env === 'production', imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngcrush()]
    })))
        .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
        .pipe(connect.reload())
});


// Livereload when a JSON file is changed
gulp.task('json', function() {
    gulp.src('builds/development/js/*.json')
        .pipe(gulpif(env === 'production', jsonminify()))
        .pipe(gulpif(env === 'production', gulp.dest('builds/production/js')))
        .pipe(connect.reload())
});


// Run all tasks below using the gulp command in the command prompt
gulp.task('default', ['html', 'json', 'coffee', 'js', 'compass', 'images', 'connect', 'watch']);