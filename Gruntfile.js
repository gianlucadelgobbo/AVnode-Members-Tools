module.exports = function(grunt) {

  grunt.initConfig({
    i18n_linter: {
      options: {
        translations: ['locales/*']
      },
      src: ['app/server/routes/*.js','app/server/helpers/*.js','app/public/js/*.js','app/server/views/*.pug','app/server/views/modals/*.pug']
    },
  });

  grunt.loadNpmTasks('grunt-i18n-linter');
  grunt.registerTask('default', ['i18n_linter']);

};