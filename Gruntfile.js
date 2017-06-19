//wrapper函数，结构如下，这是Node.js的典型写法，使用exports公开API
module.exports = function(grunt) {

  // 项目配置信息
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),   // grunt会读取package.json中的文件信息

  uglify:{
   	/* js 文件压缩 */
	options: {
		banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
		sourceMap: true,
	},
	build: {
				files: [{
					expand: true,
					cwd: 'js',
					src: '*.js',
					dest: 'js',
					ext: '.min.js'
				}],
			}
   },
});
//加载插件
grunt.loadNpmTasks('grunt-contrib-uglify');

// 执行任务，任务名称是default
grunt.registerTask('default', ['uglify']);
};