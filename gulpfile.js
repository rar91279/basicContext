var	name       = require('./package.json').moduleName,
    fs         = require('fs'),
    gulp       = require('gulp'),
    browserify = require('browserify'),
    babelify   = require('babelify'),
    source     = require('vinyl-source-stream'),
    buffer     = require('vinyl-buffer'),
    plugins    = require('gulp-load-plugins')()

var head = fs.readFileSync('./node_modules/@electerious/modulizer/head.js', { encoding: 'utf8' }),
    foot = fs.readFileSync('./node_modules/@electerious/modulizer/foot.js', { encoding: 'utf8' })

var catchError = function(err) {

	console.log(err.toString())
	this.emit('end')

}

gulp.task('styles', function() {

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

})

gulp.task('scripts', function() {

	var babelifyOpts = {
		modules: 'umd'
	}

	var bify = browserify({
		entries    : './src/scripts/basicContext.js',
		standalone : name
	})

	bify.transform(babelify.configure(babelifyOpts))
	    .bundle()
	    .on('error', catchError)
	    .pipe(source('basicContext.min.js'))
	    .pipe(buffer())
	    // .pipe(plugins.uglify())
	    // .on('error', catchError)
	    .pipe(gulp.dest('./dist'))

})

gulp.task('default', ['styles', 'scripts'])

gulp.task('watch', ['styles', 'scripts'], function() {

	gulp.watch('./src/styles/**/*.scss', ['styles'])
	gulp.watch('./src/scripts/**/*.js', ['scripts'])

})