module.exports = function(grunt) {
   grunt.registerTask('assets:public',
   [
      'cssmin:plugin',
      'uglify:plugin'
   ]);
};
