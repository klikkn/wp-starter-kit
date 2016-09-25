import gulp from 'gulp';
import watch from 'gulp-watch';
import concat from 'gulp-concat';
import cssnano from 'gulp-cssnano';
import plumber from 'gulp-plumber';
import autoprefixer from 'gulp-autoprefixer';
import uglify from 'gulp-uglify';
import less from 'gulp-less';
import vendors from 'main-bower-files';
import filter from 'gulp-filter';
import bs from 'browser-sync';
import webpack from 'webpack-stream';
import gulpif from 'gulp-if';
import addsrc from 'gulp-add-src';
import sftp from 'gulp-sftp';

let dev = process.env.NODE_ENV !== 'production';

// Путь до темы на локольном хосте
var path_to_theme = '../../local/wp-custom-pack/wp-content/themes/wp-custom';

var path = {
  build: { //Тут мы укажем куда складывать готовые после сборки файлы
    js: path_to_theme + '/js/',
    css: path_to_theme + '/css/',
    theme: path_to_theme + '',
    img: path_to_theme + '/img/',
    fonts: path_to_theme + '/fonts/'
  },
  src: { //Пути откуда брать исходники
    js: 'src/js/index.js',
    style: 'src/style/index.less',
    theme: 'src/theme/**/*.*',
    img: 'src/img/**/*.*',
    fonts: 'src/fonts/**/*.*',
    vendors: 'src/vendors/**/*.*'
  },
  watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
    js: 'src/js/**/*.js',
    style: 'src/style/**/*.less',
    theme: 'src/theme/**/*.*',
    img: 'src/img/**/*.*',
    fonts: 'src/fonts/**/*.*'
  }
};

gulp.task('browser-sync', function() {
  bs.init({
    proxy: 'wp.dev',
    logPrefix: "wp-starter-kit",
    port: 9000
  });
});

gulp.task('vendors-js', function() {
  let f = filter(['**/*.js'], {
    restore: true
  });

  return gulp.src(vendors())
    .pipe(addsrc(path.src.vendors))
    .pipe(f)
    .pipe(plumber())
    .pipe(gulpif(!dev, uglify()))
    .pipe(concat('vendors.js'))
    .pipe(gulp.dest(path.build.js))
});

gulp.task('vendors-css', function() {
  let f = filter(['**/*.css', '**/*.less'], {
    restore: true
  });

  return gulp.src(vendors())
    .pipe(addsrc(path.src.vendors))
    .pipe(f)
    .pipe(plumber())
    .pipe(less())
    .pipe(concat('vendors.css'))
    .pipe(autoprefixer())
    .pipe(gulpif(!dev, cssnano()))
    .pipe(gulp.dest(path.build.css))
});

gulp.task('js', function() {

  let options = {
    entry: './' + path.src.js,
    output: {
      filename: 'main.js'
    },
    module: {
      loaders: [{
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      }]
    }
  };

  return gulp.src(path.src.js)
    .pipe(plumber())
    .pipe(webpack(options))
    .pipe(gulpif(!dev, uglify()))
    .pipe(gulp.dest(path.build.js))
    .pipe(bs.reload({
      stream: true
    }));
});

gulp.task('style', function() {
  return gulp.src(path.src.style)
    .pipe(plumber())
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(gulpif(!dev, cssnano()))
    .pipe(gulp.dest(path.build.css))
    .pipe(bs.reload({
      stream: true
    }));
});

gulp.task('images', function() {
  return gulp.src(path.src.img)
    .pipe(gulp.dest(path.build.img))
    .pipe(bs.reload({
      stream: true
    }));
});

gulp.task('fonts', function() {
  return gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts))
});

gulp.task('theme', function() {
  return gulp.src(path.src.theme)
    .pipe(gulp.dest(path.build.theme))
    .pipe(bs.reload({
      stream: true
    }));
});

gulp.task('build', [
  'vendors-css',
  'vendors-js',
  'js',
  'style',
  'theme',
  'fonts',
  'images'
]);

gulp.task('watch', function() {
  if (dev) {
    watch([path.watch.style], function(event, cb) {
      gulp.start('style');
    });
    watch([path.watch.js], function(event, cb) {
      gulp.start('js');
    });
    watch([path.watch.theme], function(event, cb) {
      gulp.start('theme');
    });
    watch([path.watch.img], function(event, cb) {
      gulp.start('images');
    });
  }
});

gulp.task('deploy', function() {
  return gulp.src('build/*')
    .pipe(sftp({
      host: 'website.com',
      user: 'johndoe',
      pass: '1234'
    }));
});

gulp.task('default', function() {
  gulp.start('build');

  if (dev) {
    gulp.start('browser-sync');
    gulp.start('watch');
  } else {
    gulp.start('deploy');
  }
});
