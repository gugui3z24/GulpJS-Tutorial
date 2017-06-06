const gulp = require('gulp'); // Toolkit for automating painful or time-consuming tasks in your development workflow,
const htmlmin = require('gulp-html-minifier2'); // Minify HTML with html-minifier.
const uglify = require('gulp-uglify'); // Minify files with UglifyJS.
const pump = require('pump'); // Small node module that pipes streams together and destroys all of them if one of them closes.
const concat = require('gulp-concat'); // Concatenates files
const babel = require('gulp-babel'); // JavaScript Compiler
const sass = require('gulp-sass'); // Gulp plugin for sass stylesheet compiler by standard approach
const uglifycss = require('gulp-uglifycss'); // Gulp plugin to use uglifycss
const gls = require('gulp-live-server'); // Easy light weight server with livereload
const os = require('os'); // Provides a number of operating system-related utility methods.
const open = require('gulp-open'); // Open files and URLs with gulp

// Task to move HTML files from source/dev to dist/prod
gulp.task('moveIndex', () => {
  gulp.src('./src/index.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('./dist/'));
});

// Task to move JavaScript files from source/dev to dist/prod
gulp.task('javascript', (cb) => {
  pump([
    gulp.src('./src/assets/js/*.js')
    .pipe(babel({
      presets: ['es2015']
    })),
    concat('main.js'),
    uglify(),
    gulp.dest('./dist/js')
  ], cb)
});

// Task to move SASS files from source/dev to dist/prod
gulp.task('sass', () => {
  gulp.src('./src/assets/scss/*.scss')
    .pipe(sass())
    .pipe(concat('style.css'))
    .pipe(uglifycss({
      "maxLineLen": 80,
      "uglyComments": true
    }))
    .pipe(gulp.dest('./dist/css'))
});

// Task to start a development server
gulp.task('serve', () => {
  const server = gls.static('./dist', 9999);
  server.start();
  gulp.watch(['./dist/css/*.css', './dist/js/*.js', './dist/index.html'], (file) => {
    server.notify.apply(server, [file]);
  });
  const browser = os.platform() === 'linux' ? 'google-chrome' : (
    os.platform() === 'darwin' ? 'google chrome' : (
      os.platform() === 'win32' ? 'chrome' : 'firefox'));
  const options = {
    uri: 'http://localhost:9999',
    app: browser
  };
  gulp.src('./dist/index.html')
    .pipe(open(options));
});

// Default Gulp Task Definitions
gulp.task('default', ['moveIndex', 'javascript', 'sass', 'serve'], () => {
  gulp.watch('./src/*.html', ['moveIndex']);
  gulp.watch('./src/assets/js/*.js', ['javascript']);
  gulp.watch('./src/assets/scss/*.scss', ['sass']);
  console.log('Watching for files');
});

// Gulp Build Task
gulp.task('build', ['moveIndex', 'javascript', 'sass']);
