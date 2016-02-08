'use strict'

let name  = require('./package.json').moduleName
let gulp  = require('gulp')
let tasks = require('@electerious/basictasks')(gulp, name)

const scripts = tasks.scripts({
	from : './src/scripts/main.js',
	to   : './dist'
})

const styles = function() {

	tasks.styles({
		from : './src/styles/main.scss',
		to   : './dist'
	})()

	tasks.styles({
		from : './src/styles/themes/*.scss',
		name : (path) => path.basename += '.min',
		to   : './dist/themes'
	})()

	tasks.styles({
		from : './src/styles/addons/*.scss',
		name : (path) => path.basename += '.min',
		to   : './dist/addons'
	})()

}

const watch = function() {

	gulp.watch('./src/styles/**/*.scss', [ 'styles' ])
	gulp.watch('./src/scripts/**/*.js', [ 'scripts' ])

}

gulp.task('scripts', scripts)
gulp.task('styles', styles)
gulp.task('default', [ 'scripts', 'styles' ])
gulp.task('watch', [ 'default' ], watch)