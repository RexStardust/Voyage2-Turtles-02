const gulp = require('gulp');

const plumber = require('gulp-plumber'); // for error handling during 'watch' task
const del = require('del'); // for clearing out dist/assets to stay up-to-date with changes to src/assets
const sourcemaps = require('gulp-sourcemaps'); // for creating sourcemaps of css and js
const concat = require('gulp-concat'); // for combining multiple files into one file
const sass = require('gulp-sass'); // for compiling Sass into css
const cssnano = require('gulp-cssnano'); // for minifying css
const minify = require('gulp-babel-minify'); // for minifying js
const htmlReplace = require('gulp-html-replace'); // for editing specific lines of html between src and dist
const browserSync = require('browser-sync'); // for automatic reloading of page in browser, and for viewing page on multiple devices

const reload = browserSync.reload; // see browserSync above

// compiles Sass to css.
// watches sccs folder for changes, and outputs plain .css file into css folder.
// Runs first when the 'css' task is called
gulp.task('scss', () => {
  gulp.src('src/scss/**/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest('src/css/'));
});

// concatenates and minifies css files.
// outputs one file to dist/css folder. Also creates sourcemap
// When called, runs 'scss' task first, then runs itself.
// IMPORTANT: if you add more css files or folders, gulp.src needs to be updated as well
gulp.task('css', ['scss'], () => {
  const stream = gulp.src([ // add more css files here, in the order you want them to be combined
    'src/css/reset.css',
    'src/css/styles.css'])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('styles.css'))
    .pipe(cssnano())
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('dist/css/'))
    .pipe(reload({ stream: true }));

  return stream;
});

// concatenates and minifies all javascript files.
// outputs one file to dist/js folder. also creates sourcemap
// IMPORTANT: if you add more js files or folders, gulp.src needs to be updated as well
gulp.task('js', () => {
  gulp.src([ // add more js files here, in the order you want them to be combined
    'src/js/jquery-3.2.1.js',
    'src/js/jquery-ui.min.js',
    'src/js/tinycolor.js',
    'src/js/helpers.js',
    'src/js/components/clocks.js',
    'src/js/components/greeting.js',
    'src/js/components/newsfeed.js',
    'src/js/components/toolbox.js',
    'src/js/components/colorpicker.js',
    'src/js/components/background.js',
    'src/js/components/stickyNote.js',
    'src/js/components/quickLink.js',
    'src/js/components/settings.js',
    'src/js/main.js',
  ])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('app.min.js'))
    .pipe(minify())
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('dist/js'))
    .pipe(reload({ stream: true }));
});

// Changes the script and link tags in index.html to preserve refences
// to .css and .js files after the above tasks run.
// outputs one .html file to dist folder
// IMPORTANT: if you add more html files or folders, gulp.src needs to be updated as well
gulp.task('html', () => {
  gulp.src('src/index.html')
    .pipe(plumber())
    .pipe(htmlReplace({
      css: '<link rel="stylesheet" href="css/styles.css">',
      js: '<script src="js/app.min.js" defer></script>',
    }))
    .pipe(gulp.dest('dist'))
    .pipe(reload({ stream: true }));
});

gulp.task('manifest', () => {
  gulp.src('src/manifest.json')
    .pipe(plumber())
    .pipe(gulp.dest('dist'));
});

// clears dist/assets folder before copying new assets from src/assets
// runs when 'assets' is called
gulp.task('cleanfolder', () => del(['dist/assets/**']));

// copies new/changed assets into dist/assets
// when called, runs 'cleanfolder' first
gulp.task('assets', ['cleanfolder'], () => {
  const stream = gulp.src(['src/assets/**/*'])
    .pipe(gulp.dest('dist/assets'))
    .pipe(reload({ stream: true }));

  return stream;
});

// watches src directory and handles hot-reloading in browser
// also allows for viewing webiste on multiple devices
gulp.task('browser-sync', () => {
  browserSync({
    server: {
      baseDir: './src',
    }
  });
});

// watches all src folders for changes to files
gulp.task('watch', () => {
  gulp.watch('src/scss/**/*.scss', ['scss'])
  gulp.watch('./src/**/*').on('add', browserSync.reload);
  gulp.watch(['./src/**/*', '!./src/scss', '!./src/scss/**/*']).on('change', browserSync.reload);
});

// default task that runs when you type 'gulp' in command line
gulp.task('default', ['browser-sync', 'watch']);
gulp.task('build', ['html', 'js', 'css', 'assets']);
