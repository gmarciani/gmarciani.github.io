/*******************************************************************************
* GMARCIANI
* Gulp Configuration
*******************************************************************************/

/*******************************************************************************
* PACKAGES
*******************************************************************************/

// Gulp
import gulp        from 'gulp';
import plumber     from 'gulp-plumber';
import gulpIf       from 'gulp-if';
import log         from 'fancy-log';
import colors      from 'ansi-colors';

// File Management
import concat      from 'gulp-concat';
import rename      from 'gulp-rename';
import {deleteAsync} from 'del';

// Styles
import gulpSass from 'gulp-sass';
import * as dartSass from 'sass';
const sass = gulpSass(dartSass);
import cleanCss    from 'gulp-clean-css';

// Scripts
import uglify      from 'gulp-uglify';

// Images
import imageResize from 'gulp-image-resize';
import imagemin from 'gulp-imagemin';

// Views
import pug         from 'gulp-pug';
import sitemap     from 'gulp-sitemap';

// Other
import shell       from 'gulp-shell';
import isWindows   from 'is-windows';
import isOSX       from 'is-osx';

/*******************************************************************************
* CONFIGURATIONS
*******************************************************************************/
const config = {
  url: 'https://gmarciani.github.io',
  images: {
    format: 'jpg',
    people: {
      size: 400
    }
  }
}

/*******************************************************************************
* PATHS
*******************************************************************************/

const paths = {

  base        : '.',

  src      : {
    base      : 'src',
    every     : 'src/**/*',

    scripts   : {
      base    : 'src/scripts',
      every   : 'src/scripts/**/*.js'
    },

    styles    : {
      base    : 'src/styles',
      every   : 'src/styles/**/*.{css,s+(a|c)ss}',
      main    : 'src/styles/main.scss'
    },

    fonts     : {
      base    : 'src/fonts',
      every   : 'src/fonts/**/*.{woff,otf,ttf,svg,eot}'
    },

    webfonts  : {
      // Self-hosted web fonts come from npm (@fontsource/*): only the subsets
      // and weights the stylesheet actually references, woff2 only.
      every   : [
        'node_modules/@fontsource/montserrat/files/montserrat-latin-700-normal.woff2'
      ]
    },

    images    : {
      base    : 'src/images',
      every   : 'src/images/**/*.{svg,eps,png,jpg,ico}',
      brand   : {
        base    : 'src/images/brand',
        every   : 'src/images/brand/**/*.{svg,eps,png,jpg,jpeg,ico}',
        logo    : 'src/images/brand/logo.svg',
        failover: 'src/images/brand/failover.svg',
        og      : 'src/images/brand/og-base.svg'
      },
      posts   : {
        base    : 'src/images/posts',
        every   : 'src/images/posts/**/*.{svg,eps,png,jpg,jpeg,ico}'
      }
    },

    views     : {
      base    : 'src/views',
      every   : 'src/views/**/*.{pug,html,txt,xml}'
    },

    meta     : {
      base    : 'src/meta',
      every   : 'src/meta/**/*'
    }
  },

  site        : {
    base      : 'static',
    every     : 'static/**/*',

    scripts   : {
      base    : 'static/scripts',
      every   : 'static/scripts/**/*.js',
      vendor  : 'static/scripts/vendor',
      app     : {
        base  : 'static/scripts',
        main  : 'static/scripts/app.js'
      }
    },

    styles    : {
      base    : 'static/styles',
      every   : 'static/styles/**/*.css',
      main    : 'static/styles/app.css'
    },

    images    : {
      base    : 'static/images',
      every   : 'static/images/**/*.{svg,eps,png,jpg,ico}',
      brand   : 'static/images/brand',
      posts   : 'static/images/posts'
    },

    assets    : {
      base    : 'assets',
      every   : 'assets/**/*',
    },

    fonts     : {
      base    : 'assets/fonts',
      every   : 'assets/fonts/**/*.{woff,otf,ttf,svg,eot}'
    },

    webfonts  : {
      base    : 'static/fonts',
      every   : 'static/fonts/**/*.woff2'
    },

    views     : {
      base    : 'layouts',
      every   : 'layouts/**/*.html',
    },

    resources : {
      base    : 'resources',
      every   : 'resources/**/*',
    },

    public    : {
      base    : 'public',
      every   : 'public/**/*',
    }
  },

  tmp           : {
    sass        : '.sass-cache'
  }

}

/*******************************************************************************
* CLEAN
*******************************************************************************/
gulp.task('clean', function(done) {
  deleteAsync([
    paths.site.base,
    paths.site.assets.base,
    paths.site.views.base,
    paths.site.resources.base,
    paths.site.public.base,
    paths.tmp.sass
  ]);
  done();
});

/*******************************************************************************
* BUILD
*******************************************************************************/
// The tasks read from disjoint sources and write to disjoint destinations, so
// they run concurrently. Each returns its stream so Gulp waits for it to end.
gulp.task('build', function(done) {
  gulp.parallel(
    'og-base',
    'fonts',
    'webfonts',
    'views',
    'images',
    'fonts',
    'scripts',
    'styles',
    'meta'
  )(done);
});

/*******************************************************************************
* OG BASE IMAGE (branded 1200x630 canvas for social share images)
*******************************************************************************/
// Rasterizes src/images/brand/og-base.svg to assets/og/og-base.png, Hugo's
// asset directory. Hugo overlays each page's title on top of it at build time
// via images.Text (see partials/seo/meta.html), which needs a raster source.
gulp.task('og-base', function() {
  return gulp.src(paths.src.images.brand.og)
  .pipe(plumber())
  .pipe(shell(
    // ImageMagick 7 ships `magick`, ImageMagick 6 (Ubuntu apt) only `convert`.
    'mkdir -p assets/og ; im="$(command -v magick || command -v convert)" ; "$im" -background none <%= file.path %> -resize 1200x630 PNG24:assets/og/og-base.png'
  ));
});

/*******************************************************************************
* WATCH
*******************************************************************************/
gulp.task('watch', function() {
  gulp.watch(paths.src.views.every, gulp.series('views'));
  gulp.watch(paths.src.styles.every, gulp.series('styles'));
  gulp.watch(paths.src.scripts.every, gulp.series('scripts'));
});

/*******************************************************************************
* VIEWS
*******************************************************************************/
// Pug templates → compiled HTML layouts.
gulp.task('views-pug', function() {
  return gulp.src('src/views/**/*.pug')
  .pipe(plumber())
  .pipe(pug())
  .pipe(rename({
    extname: '.html'
  }))
  .pipe(gulp.dest(paths.site.views.base));
});

// Raw Hugo templates passed through verbatim (.html partials, .txt/.xml outputs).
gulp.task('views-raw', function() {
  return gulp.src('src/views/**/*.{html,txt,xml}')
  .pipe(plumber())
  .pipe(gulp.dest(paths.site.views.base));
});

gulp.task('views', gulp.parallel('views-pug', 'views-raw'));

/*******************************************************************************
* SCRIPTS
*******************************************************************************/
// Theme script is loaded separately in <head> to prevent flash
gulp.task('scripts-main', function() {
  return gulp.src(paths.src.scripts.every, { ignore: ['**/theme.js'] })
  .pipe(plumber())
  .pipe(concat('main.js'))
  .pipe(gulp.dest(paths.site.scripts.base))
  .pipe(uglify())
  .pipe(rename({
      suffix: '.min'
  }))
  .pipe(gulp.dest(paths.site.scripts.base));
});

// Copy theme script separately
gulp.task('scripts-theme', function() {
  return gulp.src('src/scripts/theme.js')
  .pipe(plumber())
  .pipe(uglify())
  .pipe(gulp.dest(paths.site.scripts.base));
});

gulp.task('scripts', gulp.parallel('scripts-main', 'scripts-theme'));

/*******************************************************************************
* STYLES
*******************************************************************************/
gulp.task('styles', function() {
  return gulp.src(paths.src.styles.every)
  .pipe(plumber())
  .pipe(sass({
    silenceDeprecations: ['legacy-js-api']
  }).on('error', sass.logError))
  .pipe(gulp.dest(paths.site.styles.base))
  .pipe(cleanCss())
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(gulp.dest(paths.site.styles.base));
});

/*******************************************************************************
* IMAGES
*******************************************************************************/
gulp.task('images', function(done) {
  gulp.parallel(
    'images-brand-logo',
    'images-brand-favicon-ico',
    'images-brand-failover',
    'images-posts')(done);
});

gulp.task('images-brand-logo', function() {
  return gulp.src(paths.src.images.brand.logo, {encoding: false})
  .pipe(gulp.dest(paths.site.images.brand));
});

// Generates favicon.ico from the single logo source. All other icon
// references (favicon.svg, apple-touch, mask, manifest, tiles) point
// directly at the served logo.svg, so no per-variant copies are needed.
gulp.task('images-brand-favicon-ico', function() {
  const icosizes = [16, 24, 32, 48, 64];
  return gulp.src(paths.src.images.brand.logo)
  .pipe(plumber())
  .pipe(shell(
    // ImageMagick 7 ships `magick`, ImageMagick 6 (Ubuntu apt) only `convert`.
    // -background none keeps the SVG's transparency instead of flattening onto white.
    'mkdir -p ' + paths.site.images.brand + ' ; im="$(command -v magick || command -v convert)" ; "$im" -background none <%= file.path %> -define icon:auto-resize='
    + icosizes.join(',') + ' '
    + paths.site.images.brand + '/favicon.ico'
  ));
});

gulp.task('images-brand-failover', function () {
  return gulp.src(paths.src.images.brand.failover, {encoding: false})
  .pipe(plumber())
  .pipe(gulp.dest(paths.site.images.brand));
});

gulp.task('images-posts', function () {
  return gulp.src(paths.src.images.posts.every, {encoding: false})
  .pipe(plumber())
  .pipe(imagemin())
  .pipe(gulp.dest(paths.site.images.posts));
});

/*******************************************************************************
* FONTS (read by Hugo's image pipeline for the social images, via resources.Get)
*******************************************************************************/
gulp.task('fonts', function() {
  return gulp.src(paths.src.fonts.every, {encoding: false})
  .pipe(plumber())
  .pipe(gulp.dest(paths.site.fonts.base));
});

/*******************************************************************************
* WEB FONTS (served to browsers; declared via @font-face in main.scss)
*******************************************************************************/
gulp.task('webfonts', function() {
  return gulp.src(paths.src.webfonts.every, {encoding: false})
  .pipe(plumber())
  .pipe(gulp.dest(paths.site.webfonts.base));
});

/*******************************************************************************
* META
*******************************************************************************/
gulp.task('meta', function() {
  // dot: true so dotfiles (.manifest.json, .msconfig.xml) are also published.
  return gulp.src(paths.src.meta.every, { dot: true })
  .pipe(plumber())
  .pipe(gulp.dest(paths.site.base));
});

/*******************************************************************************
* PRODUCTION
*******************************************************************************/
gulp.task('production', function() {
  gulp.start('sitemap');
});

gulp.task('sitemap', function() {
  return gulp.src(paths.site.views, { read: false })
  .pipe(plumber())
  .pipe(sitemap({
      siteUrl: config.url
  }))
  .pipe(gulp.dest(paths.site.base));
});

/*******************************************************************************
* UTILS
*******************************************************************************/
function message(scope, command, argument) {
  log(
    colors.cyan(scope), ':',
    colors.blue(command), ':',
    colors.yellow(argument)
  );
}

function printout(error, stdout, stderr) {
  console.log(stdout);
  console.log(stderr);
  if (error !== null) {
    console.log(stderr);
  }
}

gulp.task('check-platform', function() {
  if (isWindows()) {
    console.log('we are on Windows');
  } else if (isOSX()) {
    console.log('we are on OSX');
  } else {
    console.log('we are on Linux');
  }
});
