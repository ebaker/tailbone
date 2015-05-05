/* gulpfile.js */
 
// Load some modules which are installed through NPM.
var gulp = require('gulp');
var browserify = require('browserify');  // Bundles JS.
var del = require('del');  // Deletes files.
var reactify = require('reactify');  // Transforms React JSX to JS.
var source = require('vinyl-source-stream');
var stylus = require('gulp-stylus');  // To compile Stylus CSS.
var nodemon = require('gulp-nodemon');
 
// Define some paths.
var paths = {
  css: ['app/css/*.styl'],
  app_js: ['./app/scripts/app.jsx'],
  html: ['./app/index.html'],
  dest: './build'
};
 
// An example of a dependency task, it will be run before the css/js tasks.
// Dependency tasks should call the callback to tell the parent task that
// they're done.
gulp.task('clean', function(done) {
  del([paths.dest + '/**/*.*'], done);
});

// Copy html
gulp.task('copy', function(){
  return gulp.src(paths.html)
    .pipe(gulp.dest(paths.dest));
});
 
// Our CSS task. It finds all our Stylus files and compiles them.
gulp.task('css', function() {
  return gulp.src(paths.css)
    .pipe(stylus())
    .pipe(gulp.dest(paths.dest + '/css'));
});
 
// Our JS task. It will Browserify our code and compile React JSX files.
gulp.task('js', function() {
  // Browserify/bundle the JS.
  browserify(paths.app_js)
    .transform(reactify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(paths.dest));
});
 
// Rerun tasks whenever a file changes.
gulp.task('watch', function() {
  gulp.watch(paths.css, ['css']);
  gulp.watch(paths.js, ['js']);
});
 
gulp.task('start', function () {
  nodemon({
    script: 'server.js'
    , ext: 'js html'
    , env: { 'NODE_ENV': 'development' }
  });
});

// The default task (called when we run `gulp` from cli)
gulp.task('default', ['watch', 'css', 'js', 'copy', 'start']);
gulp.task('build', ['clean', 'css', 'js', 'copy']);
