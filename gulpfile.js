/*******************************************************************************
* GMARCIANI
* Gulp Configuration
*******************************************************************************/

/*******************************************************************************
* PACKAGES
*******************************************************************************/

// Gulp
const gulp        = require('gulp');
const gutil       = require('gulp-util');
const plumber     = require('gulp-plumber');
const gulpIf       = require('gulp-if');

// File Management
const concat      = require('gulp-concat');
const rename      = require('gulp-rename');
const del         = require('del');

// Styles
const sass        = require('gulp-sass')(require('sass'));
const cleanCss    = require('gulp-clean-css');
sass.compiler   = require('node-sass');

// Scripts
const uglify      = require('gulp-uglify');

// Images
const svg2png     = require('gulp-svg2png');
const imageResize = require('gulp-image-resize');

// Views
const pug         = require('gulp-pug');
const sitemap     = require('gulp-sitemap');

// Other
const shell       = require('gulp-shell');
const isWindows   = require('is-windows');
const isOSX       = require('is-osx');

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
      every   : 'src/views/**/*.{pug,html}'
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
  del([
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
    'views',
    'fonts',
    'images',
    'scripts',
    'styles',
    'meta'
  )(done);
});

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
  const isPugFile = function(file) { return file.extname === '.pug' };
  gulp.src(paths.src.views.every)
  .pipe(plumber())
  .pipe(gulpIf(isPugFile, pug()))
  .pipe(rename({
    extname: '.html'
  }))
  .pipe(gulp.dest(paths.site.views.base));
  done();
});

/*******************************************************************************
* SCRIPTS
*******************************************************************************/
gulp.task('scripts', function(done) {
  gulp.src(paths.src.scripts.every)
  .pipe(plumber())
  .pipe(concat('main.js'))
  .pipe(gulp.dest(paths.site.scripts.base))
  .pipe(uglify())
  .pipe(rename({
      suffix: '.min'
  }))
  .pipe(gulp.dest(paths.site.scripts.base));
  done();
});

/*******************************************************************************
* STYLES
*******************************************************************************/
gulp.task('styles', function(done) {
  gulp.src(paths.src.styles.every)
  .pipe(plumber())
  .pipe(sass().on('error', sass.logError))
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
  .pipe(gulp.dest(paths.site.images.brand))
  .pipe(plumber())
  .pipe(svg2png())
  .pipe(imageResize({
    width: logo.width,
    height: logo.height,
    crop: false,
    upscale: false,
    imageMagick: true
  }))
  .pipe(rename({
    basename: logo.name
  }))
  .pipe(gulp.dest(paths.site.images.brand));
  done();
});

gulp.task('images-brand-favicons', function(done) {
  const icons = [
    {name: 'favicon-64', width: 64, height: 64},
    {name: 'favicon-48', width: 48, height: 48},
    {name: 'favicon-32', width: 32, height: 32},
    {name: 'favicon-24', width: 24, height: 24},
    {name: 'favicon-16', width: 16, height: 16}
  ];

  const icosizes = [16, 24, 32, 48, 64];

  gulp.src(paths.src.images.brand.favicon, {encoding: false})
  .pipe(plumber())
  .pipe(gulp.dest(paths.site.images.brand));

  gulp.src(paths.src.images.brand.favicon)
  .pipe(plumber())
  .pipe(shell(
    'convert <%= file.path %> -define icon:auto-resize='
    + icosizes.join(',') + ' '
    + paths.site.images.brand + '/favicon.ico'
  ));

  icons.forEach(function(image) {
    gulp.src(paths.src.images.brand.favicon, {encoding: false})
    .pipe(plumber())
    .pipe(svg2png())
    .pipe(imageResize({
      width: image.width,
      height: image.height,
      crop: false,
      upscale: false,
      imageMagick: true
    }))
    .pipe(rename({
      basename: image.name
    }))
    .pipe(gulp.dest(paths.site.images.brand));
  });
  done();
});

gulp.task('images-brand-apple-icons', function(done) {
  const icons = [
    {name: 'apple-touch-icon-180', width: 180, height: 180},
    {name: 'apple-touch-icon-152', width: 152, height: 152},
    {name: 'apple-touch-icon-120', width: 120, height: 120},
    {name: 'apple-touch-icon-76', width: 76, height: 76},
    {name: 'apple-touch-icon-57', width: 57, height: 57}
  ];

  const startups = [
    {name: 'apple-touch-startup-image-320x480', width: 320, height: 480}
  ];

  icons.forEach(function(image) {
    gulp.src(paths.src.images.brand.icon, {encoding: false})
    .pipe(plumber())
    .pipe(svg2png())
    .pipe(imageResize({
      width: image.width,
      height: image.height,
      crop: false,
      upscale: false,
      imageMagick: true
    }))
    .pipe(rename({
      basename: image.name
    }))
    .pipe(gulp.dest(paths.site.images.brand));
  });

  startups.forEach(function(image) {
    gulp.src(paths.src.images.brand.startup, {encoding: false})
    .pipe(plumber())
    .pipe(svg2png())
    .pipe(imageResize({
      width: image.width,
      height: image.height,
      crop: false,
      upscale: false,
      imageMagick: true
    }))
    .pipe(rename({
      basename: image.name
    }))
    .pipe(gulp.dest(paths.site.images.brand));
  });

  gulp.src(paths.src.images.brand.mask)
  .pipe(plumber())
  .pipe(gulp.dest(paths.site.images.brand));
  done();
});

gulp.task('images-brand-google-icons', function(done) {
  const icons = [
    {name: 'google-icon-192', width: 192, height: 192},
    {name: 'google-icon-144', width: 144, height: 144},
    {name: 'google-icon-96', width: 96, height: 96},
    {name: 'google-icon-72', width: 72, height: 72},
    {name: 'google-icon-48', width: 48, height: 48},
    {name: 'google-icon-36', width: 36, height: 36}
  ];

  icons.forEach(function(image) {
    gulp.src(paths.src.images.brand.icon, {encoding: false})
    .pipe(plumber())
    .pipe(svg2png())
    .pipe(imageResize({
      width: image.width,
      height: image.height,
      crop: false,
      upscale: false,
      imageMagick: true
    }))
    .pipe(rename({
      basename: image.name
    }))
    .pipe(gulp.dest(paths.site.images.brand));
  });
  done();
});

gulp.task('images-brand-microsoft-icons', function(done) {
  const icons = [
    {name: 'microsoft-tile-image-large', width: 310, height: 310},
    {name: 'microsoft-tile-image-medium', width: 150, height: 150},
    {name: 'microsoft-tile-image-small', width: 70, height: 70}
  ];

  icons.forEach(function(image) {
    gulp.src(paths.src.images.brand.icon, {encoding: false})
    .pipe(plumber())
    .pipe(svg2png())
    .pipe(imageResize({
      width: image.width,
      height: image.height,
      crop: false,
      upscale: false,
      imageMagick: true
    }))
    .pipe(rename({
      basename: image.name
    }))
    .pipe(gulp.dest(paths.site.images.brand));
  });
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
  gulp.src(paths.src.meta.every)
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
  gutil.log(
    gutil.colors.cyan(scope), ':',
    gutil.colors.blue(command), ':',
    gutil.colors.yellow(argument)
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
