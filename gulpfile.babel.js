
'use strict';



var fs           = require('fs'),
    path         = require('path'),

    del          = require('del'),
    source       = require('vinyl-source-stream'),
    gulp         = require('gulp'),

    browserify   = require('browserify'),

    esdoc        = require('gulp-esdoc'),
    rename       = require('gulp-rename'),
    closure      = require('gulp-closure-compiler'),
    babel        = require('gulp-babel');



var dirs         = { 'build': './build', 'dist': './dist', 'doc': './doc' },
    babel_cfg    = { 'presets': [ 'es2015' ] };



var production   = false,

    errorHandler = function(err) {
      console.log(err.toString());
      this.emit('end');
    };





gulp.task('babel', ['setup'], function() {

  return gulp.src(['src/js/husl_harmony.js'])
    .pipe(babel(babel_cfg))
    .pipe(rename('husl_harmony.es5.js'))
    .pipe(gulp.dest('./build'));

});





gulp.task('clean', function(done) {
  del(['./doc', './dist', './build']).then(() => done());
});





gulp.task('browserify', ['babel'], function() {

  var browserifyConfig = {}, 
      bpack            = browserify(browserifyConfig, { 'debug' : !production });

  return bpack
    .require('./build/husl_harmony.es5.js', { 'expose' : 'husl_harmony' })
    .bundle()
    .on('error', errorHandler)
    .pipe(source('husl_harmony.es5.browserified.js'))
    .pipe(gulp.dest('./build'));

});





// temp disabled - closure compiler panics on seeing the use of 'default', which in es5 is a forbidden keyword, from the babel shim for the keyword
// probably fixable; haven't tried yet

gulp.task('closure5', ['build'], function() {

  return gulp.src('build/husl_harmony.es5.js')

    .pipe(closure( {
      compilerPath: 'node_modules/closure-compiler/node_modules/google-closure-compiler/compiler.jar',
      fileName: 'husl_harmony.es5.min.js'
    } ))
    
    .pipe(gulp.dest('./build'));

});





// temp disabled - "export {foo}" kills closure compiler in es6 mode
// https://github.com/google/closure-compiler/issues/1636
// appears to be fixed in unreleased https://github.com/google/closure-compiler/commit/d62eb21375427b25b87490cedd833ce4f6cd0371

gulp.task('closure6', ['build'], function() {

  return gulp.src('src/js/husl_harmony.js')

    .pipe(closure( {
      compilerPath: 'node_modules/closure-compiler/node_modules/google-closure-compiler/compiler.jar',
      compilerFlags: {'language_in':'ECMASCRIPT6'},
      fileName: 'husl_harmony.es6.min.js'
    } ))

    .pipe(gulp.dest('./build'));

});





gulp.task('make-dirs', ['clean'], function(done) {

  for (var key in dirs) {
    try      { fs.mkdirSync('.' + path.sep + path.normalize(dirs[key])); }
    catch(e) { if (e.code !== 'EEXIST') { console.log('caught ' + JSON.stringify(e) + ' while making dirs'); } }
  }

  done();

});





gulp.task('doc', ['build'], function() {

  return gulp.src('./src/js')
    .pipe(esdoc({ destination: './doc' }));

});





gulp.task('html', ['clean'], function() {

  return gulp.src('./src/html/*.html')
    .pipe(gulp.dest('./build'));

});





gulp.task('js', ['clean'], function() {

  return gulp.src(['src/js/*.js'])
    .pipe(gulp.dest('./build'));

});





gulp.task('setup', ['make-dirs']);





gulp.task('build', ['browserify', 'html', 'js'], function() {});





gulp.task('default', [/*'closure5', 'closure6', */ 'build', 'doc']);
