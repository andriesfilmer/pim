module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    env : {
      dev: {
          NODE_ENV : 'DEVELOPMENT'
      },
      prod : {
          NODE_ENV : 'PRODUCTION'
      }
    },
    preprocess : {
      layout: {
        src : 'src/layout/index.html',
        dest : 'public/index.html',
        options : {
          context : {
            pkgname : '<%= pkg.name %>',
          }
        }
      }
    },
    jshint: {
      options: {
        globals: {
          angular: true
        },
      },
      all: ['Gruntfile.js', 'src/js/*.js']
    },
    copy: {
      static:   { src: 'static/**/*', dest: 'public/' },
      vendor:   { src: 'vendor/**/*', dest: 'public/' },
      manifest: { src: 'manifest.appcache', dest: 'public/' }
    },
    sass: {
      options: {
        sourcemap: 'none'
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'src/scss',
          src: ['*.scss'],
          dest: 'tmp/css',
          ext: '.css'
        }]
      }
    },
    concat: {
      dev: {
        files: {
          'public/css/<%= pkg.name %>.css': ['tmp/css/*.css'],
          'public/js/<%= pkg.name %>.js': ['src/js/*.js'],
        }
      },
      prod: {
        files: {
          'public/css/<%= pkg.name %>.css': ['tmp/css/*.css'],
          'public/js/<%= pkg.name %>.js': ['src/js/*.js'],
          'public/vendor/js/all.js': [
            'vendor/js/angular.min.js',
            'vendor/js/angular-route.min.js',
            'vendor/js/angular-sanitize.min.js',
            'vendor/js/jquery.min.js',
            'vendor/js/ngStorage.min.js',
            'vendor/js/foundation.min.js',
            'vendor/js/showdown.js',
            'vendor/js/showdown-table.js',
            'vendor/js/markdown.js'],
          'public/vendor/css/all.css': [
             'vendor/css/normalize.css',
             'vendor/css/foundation.css',
             'vendor/css/foundation-icons.css'],
        },
      }
    },
    cssmin: {
      add_banner: {
        options: {
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */'
        },
        files: {
          'public/css/<%= pkg.name %>.min.css': ['public/css/<%= pkg.name %>.css'],
          'public/vendor/css/all.min.css': ['public/vendor/css/all.css']
        }
      }
    },
    uglify: {
      buildJs: {
        options: {
          mangle: false,
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */'
        },
        files: {
          'public/js/<%= pkg.name %>.min.js' : ['public/js/<%= pkg.name %>.js']
        }
      },
    },
    appcache: {
      options: {
        basePath: 'public',
        preferOnline: true
      },
      all: {
        dest: 'public/manifest.appcache',
        cache: 'public/**/*',
        network: ['*', 'http://*', 'https://*'],
        fallback: '/ /partials/offline.html'
      }
    },
    jade: {
      compile: {
        options: {
            pretty: true
        },
        files: [ { 
          expand: true, 
          dest: "public/partials",
          src: "**/*.jade", 
          cwd: "src/partials",
          ext: '.html',
          extDot: 'last'
        } ]
      }
    },
    clean: {
      dev: ["public/js/<%= pkg.name %>.js",
            "public/css/<%= pkg.name %>.css",
            "public/vendor/css/all.css"]
    },
    watch: {
      all: {
        options: { livereload: true },
        files: ['src/layout/*', 'src/js/*', 'src/scss/*','src/partials/**/*.jade'],
        tasks: ['default']
      },
    },
    connect: {
      server: {
        options: {
          port: 3000,
          base: 'public',
          livereload: true
        }
      }
    }
  });

  // Load the plugin that provides the tasks.
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-appcache');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jade');

  // Default task(s).
  grunt.registerTask('default', ['env:dev',  'preprocess', 'sass', 'concat:dev',  'uglify', 'jade', 'connect','watch']);
  // grunt prod task(s).
  grunt.registerTask('prod',    ['env:prod', 'preprocess', 'sass', 'concat:prod', 'cssmin', 'uglify', 'jade', 'copy', 'appcache', 'clean']);


};
