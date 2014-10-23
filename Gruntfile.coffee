module.exports = (grunt) ->
  bootstrapFolder = 'bower_components/bootstrap/dist/'
  jQueryFolder = 'bower_components/jquery/dist/'
  publicFolder = 'public/lib/'

  grunt.initConfig
    copy:
      main:
        files: [
          {
            cwd: bootstrapFolder + 'js/'
            expand: true
            src: '*.min.js'
            dest: publicFolder + 'scripts/'
          }, {
            cwd: bootstrapFolder + 'css/'
            expand: true
            src: '*.min.css'
            dest: publicFolder + 'stylesheets/'
          }, {
            cwd: bootstrapFolder + 'fonts/'
            expand: true
            src: '*'
            dest: publicFolder + 'fonts/'
          }, {
            cwd: jQueryFolder
            expand: true
            src: '*.min.js'
            dest: publicFolder + 'scripts/'
          }
        ]
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.registerTask('default', ['copy'])