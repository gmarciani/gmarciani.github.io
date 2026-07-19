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

    images    : {
      base    : 'src/images',
      every   : 'src/images/**/*.{svg,eps,png,jpg,ico}',
      brand   : {
        base    : 'src/images/brand',
        every   : 'src/images/brand/**/*.{svg,eps,png,jpg,jpeg,ico}',
        logo    : 'src/images/brand/logo.svg',
        favicon : 'src/images/brand/favicon.svg',
        icon    : 'src/images/brand/icon.svg',
        startup : 'src/images/brand/startup.svg',
        mask    : 'src/images/brand/mask.svg',
        failover: 'src/images/brand/failover.svg'
      },
      posts   : {
        base    : 'src/images/posts',
        every   : 'src/images/posts/**/*.{svg,eps,png,jpg,jpeg,ico}'
      }
    },

    views     : {
      base    : 'src/views',
      every   : 'src/views/**/*.{pug,html,txt}'
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

    fonts     : {
      base    : 'static/fonts',
      every   : 'static/fonts/**/*.{woff,otf,ttf,svg,eot}'
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
gulp.task('build', function(done) {
  gulp.series(
    'og-base',
    'views',
    'fonts',
    'images',
    'scripts',
    'styles',
    'meta'
  )(done);
});

/*******************************************************************************
* OG BASE IMAGE (branded 1200x630 canvas for social share images)
*******************************************************************************/
// Regenerates assets/og/og-base.png. Hugo overlays each page's title on top of
// this canvas at build time via images.Text (see partials/seo/meta.html).
gulp.task('og-base', shell.task('node scripts/gen-og-base.mjs'));

/*******************************************************************************
* WATCH
*******************************************************************************/
gulp.task('watch', function() {
  gulp.watch(paths.src.views.every, gulp.series('views'));
  gulp.watch(paths.src.styles.every, gulp.series('styles'));
  gulp.watch(paths.src.scripts.every, gulp.series('scripts'));
  gulp.watch(paths.src.fonts.every, gulp.series('fonts'));
});

/*******************************************************************************
* VIEWS
*******************************************************************************/
gulp.task('views', function(done) {
  // Pug templates → compiled HTML layouts.
  gulp.src('src/views/**/*.pug')
  .pipe(plumber())
  .pipe(pug())
  .pipe(rename({
    extname: '.html'
  }))
  .pipe(gulp.dest(paths.site.views.base));

  // Raw Hugo templates passed through verbatim (.html partials, .txt outputs).
  gulp.src('src/views/**/*.{html,txt}')
  .pipe(plumber())
  .pipe(gulp.dest(paths.site.views.base));
  done();
});

/*******************************************************************************
* SCRIPTS
*******************************************************************************/
gulp.task('scripts', function(done) {
  // Theme script is loaded separately in <head> to prevent flash
  gulp.src(paths.src.scripts.every, { ignore: ['**/theme.js'] })
  .pipe(plumber())
  .pipe(concat('main.js'))
  .pipe(gulp.dest(paths.site.scripts.base))
  .pipe(uglify())
  .pipe(rename({
      suffix: '.min'
  }))
  .pipe(gulp.dest(paths.site.scripts.base));

  // Copy theme script separately
  gulp.src('src/scripts/theme.js')
  .pipe(plumber())
  .pipe(uglify())
  .pipe(gulp.dest(paths.site.scripts.base));

  done();
});

/*******************************************************************************
* STYLES
*******************************************************************************/
gulp.task('styles', function(done) {
  gulp.src(paths.src.styles.every)
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
  done();
});

/*******************************************************************************
* IMAGES
*******************************************************************************/
gulp.task('images', function(done) {
  gulp.series(
    'images-brand-logo',
    'images-brand-favicons',
    'images-brand-apple-icons',
    'images-brand-google-icons',
    'images-brand-microsoft-icons',
    'images-brand-failover',
    'images-posts')(done);
});

gulp.task('images-brand-logo', function(done) {
  const logo = {name: 'logo', width: 500, height: 500};

  gulp.src(paths.src.images.brand.logo, {encoding: false})
  .pipe(gulp.dest(paths.site.images.brand));
  done();
});

gulp.task('images-brand-favicons', function(done) {
  gulp.src(paths.src.images.brand.favicon, {encoding: false})
  .pipe(plumber())
  .pipe(gulp.dest(paths.site.images.brand));

  const icosizes = [16, 24, 32, 48, 64];
  gulp.src(paths.src.images.brand.favicon)
  .pipe(plumber())
  .pipe(shell(
    // ImageMagick 7 ships `magick`, ImageMagick 6 (Ubuntu apt) only `convert`.
    // -background none keeps the SVG's transparency instead of flattening onto white.
    'mkdir -p ' + paths.site.images.brand + ' ; im="$(command -v magick || command -v convert)" ; "$im" -background none <%= file.path %> -define icon:auto-resize='
    + icosizes.join(',') + ' '
    + paths.site.images.brand + '/favicon.ico'
  ));
  done();
});

gulp.task('images-brand-apple-icons', function(done) {
  gulp.src(paths.src.images.brand.icon, {encoding: false})
  .pipe(plumber())
  .pipe(gulp.dest(paths.site.images.brand));

  gulp.src(paths.src.images.brand.startup, {encoding: false})
  .pipe(plumber())
  .pipe(gulp.dest(paths.site.images.brand));

  gulp.src(paths.src.images.brand.mask)
  .pipe(plumber())
  .pipe(gulp.dest(paths.site.images.brand));
  done();
});

gulp.task('images-brand-google-icons', function(done) {
  gulp.src(paths.src.images.brand.icon, {encoding: false})
  .pipe(plumber())
  .pipe(gulp.dest(paths.site.images.brand));
  done();
});

gulp.task('images-brand-microsoft-icons', function(done) {
  gulp.src(paths.src.images.brand.icon, {encoding: false})
  .pipe(plumber())
  .pipe(gulp.dest(paths.site.images.brand));
  done();
});

gulp.task('images-brand-failover', function (done) {
  gulp.src(paths.src.images.brand.failover, {encoding: false})
  .pipe(plumber())
  .pipe(gulp.dest(paths.site.images.brand));
  done();
});

gulp.task('images-posts', function (done) {
  gulp.src(paths.src.images.posts.every, {encoding: false})
  .pipe(plumber())
  .pipe(imagemin())
  .pipe(gulp.dest(paths.site.images.posts));
  done();
});

/*******************************************************************************
* FONTS
*******************************************************************************/
gulp.task('fonts', function(done) {
  gulp.src(paths.src.fonts.every)
  .pipe(plumber())
  .pipe(gulp.dest(paths.site.fonts.base));
  done();
});

/*******************************************************************************
* META
*******************************************************************************/
gulp.task('meta', function(done) {
  // dot: true so dotfiles (.manifest.json, .msconfig.xml) are also published.
  gulp.src(paths.src.meta.every, { dot: true })
  .pipe(plumber())
  .pipe(gulp.dest(paths.site.base));
  done();
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
