module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // We have a different index.html for development.
    // With each js and css file separate. Created by 'preprocess'
    env: {
      dev: {
          NODE_ENV : 'DEVELOPMENT'
      },
      prod: {
          NODE_ENV : 'PRODUCTION'
      }
    },
    preprocess: {
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
    // We have a different configuration for development and production.
    // We write a new file with a module and a ENV constant.
    // See AuthenticationService for the constants.
    ngconstant: {
      options: {
        name: 'appConfig',
        wrap: '// Module created by Gruntfile.js. Don\'t edit here!.\n{%= __ngModule %}\n\n'
      },
      dev: {
        options: {
          dest: 'src/js/config.js',
        },
        constants: {
          ENV: 'development'
        }
      },
      prod: {
        options: {
          dest: 'src/js/config.js',
        },
        constants: {
          ENV: 'production'
        }
      }
    },
    mkdir: {
      all: {
        options: {
          mode: 0777,
          create: ['public/upload/contact_photos/']
        },
      },
    },
    // JSHint, detect errors and potential problems in your JavaScript code.
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
      foundation: {
        files: [{
          expand: true,
          cwd: 'src/scss/foundation',
          src: ['*.scss'],
          dest: 'public/vendor/css',
          ext: '.css'
        }]
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
    // Remove console.log
    removelogging: {
      dist: {
        // File will be overwritten with the output!
        src: "public/js/<%= pkg.name %>.js" 
      }
    },
    concat: {
      dev: {
        files: {
          'public/css/<%= pkg.name %>.css': ['tmp/css/*.css'],
          'public/vendor/js/foundation.js': ['vendor/js/foundation/**/*.js'],
          'public/js/<%= pkg.name %>.js': ['src/js/*.js']
        }
      },
      prod: {
        // Concat files for production. File order is important!
        files: {
          'public/css/<%= pkg.name %>.css': ['tmp/css/*.css'],
          'public/js/<%= pkg.name %>.js': ['src/js/*.js'],
          'public/vendor/js/vendor.js': [
            'vendor/js/modernizr.js',
            'vendor/js/jquery.min.js',
            'vendor/js/angular.min.js',
            'vendor/js/angular-ui-router.min.js',
            'vendor/js/angular-touch.min.js',
            'vendor/js/angular-animate.min.js',
            'vendor/js/moment.min.js',
            'vendor/js/calendar.js',
            'vendor/js/fullcalendar.min.js',
            'vendor/js/foundation.min.js',
            'vendor/js/showdown.js',
            'vendor/js/spin.min.js',
            'vendor/js/angular-spinner.min.js',
            'vendor/js/showdown-table.js'
          ],
          'public/vendor/css/vendor.css': [
             'vendor/css/normalize.css',
             'public/vendor/css/foundation.css',
             'vendor/css/fullcalendar.css',
             'vendor/css/foundation-icons.css'],
        },
      }
    },
    // Minify CSS for production
    cssmin: {
      add_banner: {
        options: {
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */'
        },
        files: {
          'public/css/<%= pkg.name %>.min.css': ['public/css/<%= pkg.name %>.css'],
          'public/vendor/css/vendor.min.css': ['public/vendor/css/vendor.css']
        }
      }
    },
    // Minify JS for production
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
    // Application caching for production
    appcache: {
      options: {
        basePath: 'public',
        preferOnline: true
      },
      all: {
        dest: 'public/manifest.appcache',
        cache: 'public/**/*',
        network: ['*', 'http://*', 'https://*'],
        fallback: '/ /partials/home.html'
      }
    },
    // Jade templating language focused on enabling quick HTML coding
    jade: {
      compile: {
        options: {
            pretty: true,
            data: {package: '<%= pkg.name %>', version: '<%= pkg.version %>'}
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
    // Cleanup files we don't need on production
    clean: {
      dev: ["tmp/*",
            "public/js/<%= pkg.name %>.js",
            "public/css/<%= pkg.name %>.css",
            "public/vendor/css/vendor.css"]
    },
    // Watch files we edit an reload the app on save.
    watch: {
      all: {
        options: { livereload: true },
        files: ['Gruntfile.js', 'src/layout/*', 'src/js/*', 'src/scss/*','src/partials/**/*.jade'],
        tasks: ['default']
      },
    },
    // Webserver for development
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
  grunt.loadNpmTasks('grunt-ng-constant');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks("grunt-remove-logging");


  // Run once to compile foundation css and copy vendor files, save time on development ;)
  grunt.registerTask('once', ['sass:foundation', 'copy', 'mkdir']);

  // Default tasks for development
  grunt.registerTask('default', ['env:dev',  'preprocess', 'ngconstant:dev', 'sass:dist', 'concat:dev', 
                                 'uglify', 'jade', 'jshint', 'connect','watch']);

  // grunt for production (minified files, remove logging, clean-up)
  grunt.registerTask('production', ['once', 'env:prod', 'preprocess', 'ngconstant:prod', 'sass', 
                                    'concat:prod', 'removelogging', 'cssmin', 'uglify', 
                                    'jade', 'appcache', 'clean']);

};
