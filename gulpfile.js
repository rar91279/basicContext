'use strict'

let	name       = require('./package.json').moduleName,
    fs         = require('fs'),
    gulp       = require('gulp'),
    browserify = require('browserify'),
    babelify   = require('babelify'),
    source     = require('vinyl-source-stream'),
    buffer     = require('vinyl-buffer'),
    plugins    = require('gulp-load-plugins')()

const catchError = function(err) {

	console.log(err.toString())
	this.emit('end')

}

const styles = function() {

	gulp.src('./src/styles/main.scss')
	    .pipe(plugins.sass())
	    .on('error', catchError)
	    .pipe(plugins.concat(name + '.min.css', { newLine: "\n" }))
	    .pipe(plugins.autoprefixer('last 2 version', '> 1%'))
	    .pipe(plugins.minifyCss())
	    .pipe(gulp.dest('./dist'))

	gulp.src('./src/styles/themes/*.scss')
	    .pipe(plugins.sass())
	    .on('error', catchError)
	    .pipe(plugins.rename(function(path) { path.basename += '.min' }))
	    .pipe(plugins.autoprefixer('last 2 version', '> 1%'))
	    .pipe(plugins.minifyCss())
	    .pipe(gulp.dest('./dist/themes'))

	gulp.src('./src/styles/addons/*.scss')
	    .pipe(plugins.sass())
	    .on('error', catchError)
	    .pipe(plugins.rename(function(path) { path.basename += '.min' }))
	    .pipe(plugins.autoprefixer('last 2 version', '> 1%'))
	    .pipe(plugins.minifyCss())
	    .pipe(gulp.dest('./dist/addons'))

}

const scripts = function() {

	let bify = browserify({
		entries    : './src/scripts/basicContext.js',
		standalone : name
	})

	let transformer = babelify.configure({})

	bify.transform(transformer)
	    .bundle()
	    .on('error', catchError)
	    .pipe(source('basicContext.min.js'))
	    .pipe(buffer())
	    .pipe(plugins.uglify())
	    .on('error', catchError)
	    .pipe(gulp.dest('./dist'))

}

const watch = function() {

	gulp.watch('./src/styles/**/*.scss', ['styles'])
	gulp.watch('./src/scripts/**/*.js', ['scripts'])

}

gulp.task('styles', styles)
gulp.task('scripts', scripts)
gulp.task('default', ['styles', 'scripts'])
gulp.task('watch', ['styles', 'scripts'], watch)