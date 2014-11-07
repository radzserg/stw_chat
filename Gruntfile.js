module.exports = function(grunt) {

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Load Grunt tasks declared in the package.json file
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);


    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        config: {
            // Configurable paths
            app: 'public'
        },


        // Automatically inject Bower components into the app
        wiredep: {
            app: {
                src: ['<%= config.app %>/index.html']
            }
        },


        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    dest: '<%= config.app %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        '*.html',
                        'views/{,*/}*.html',
                        'images/{,*/}*.{webp}',
                        'fonts/*'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/images',
                    dest: '<%= yeoman.dist %>/images',
                    src: ['generated/*']
                }, {
                    expand: true,
                    cwd: 'bower_components/bootstrap/dist',
                    src: 'fonts/*',
                    dest: '<%= yeoman.dist %>'
                }]
            },
            styles: {
                expand: true,
                cwd: '<%= yeoman.app %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            }
        },


        /**
        uglify: {
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        }
        */

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            /**
            livereload: {
                options: {
                    livereload: '<%= connect.server.options.livereload %>'
                },
                files: [
                ]
            }, */
            bower: {
                files: ['bower.json']
                /** tasks: ['wiredep'] */
            },
            jst: {
                files: [
                    "<%= config.app %>/jst/**/*.html"
                ],
                tasks: ["jst"]
            }
        },

        // The actual grunt server settings
        connect: {

            server: {
                options: {
                    port: 9000,
                    livereload: 35729,
                    base: "public",
                    hostname: 'localhost'
                },

                proxies: [
                    {
                        context: '/users',
                        host: 'localhost',
                        port: 3000,
                        https: false
                        // xforward: false,
                        //headers: {
                        //    "x-custom-added-header": value
                        //}
                    }
                ]
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        '<%= config.app %>'
                    ]
                }
            }
        },

        jst: {
            compile: {
                options: {
                    processName: function(filepath) {
                        // cut // public/jst/ and .html at the end
                        return filepath.substr(11).slice(0, -5);
                    }
                },
                files: {
                    "public/js/templates.js": ["<%= config.app %>/jst/**/*.html"]
                }
            }
        }
    });


    grunt.registerTask('serve', function (target) {
        grunt.task.run([
            'connect:livereload',
            'configureProxies:server',
            'watch',
        ]);
    });

    grunt.registerTask('build', [
        'copy:dist',
    ]);


    grunt.registerTask('default',  function (target) {
        grunt.task.run([
            'build',
        ]);
    });



};