/* global module */
module.exports = function (grunt) {
	grunt.initConfig({
		less:   {
			shifter: {
				options: {
					compress: true
				},
				files:   {
					'public/css/shifter.css': [ 'public_src/less/*.less' ]
				}
			}
		},
		uglify: {
			shifter: {
				files: {
					'public/js/shifter.min.js': [ 'public_src/js/shifter.js' ]
				}
			}
		}
	});
	require('load-grunt-tasks')(grunt);
	grunt.registerTask('default', [ 'uglify' ]);
};
