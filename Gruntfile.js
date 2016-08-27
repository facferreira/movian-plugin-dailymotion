module.exports = function(grunt) {
    var pluginJson = grunt.file.readJSON('plugin.json');
    var version = pluginJson.version;

    grunt.initConfig({
        compress: {
            main: {
                options: {
                    archive: 'releases/release_' + version + '.zip'
                },
                files: [
                    {src: ['dailymotion.js'], dest: '/'},
                    {expand: true, src: ['support/**.js'], dest: '/'},
                    {src: ['icon.png'], dest: '/'},
                    {src: ['LICENSE'], dest: '/'},
                    {src: ['plugin.json'], dest: '/'}
                ]
            }
        }
    });

    // load plugins
    grunt.loadNpmTasks('grunt-contrib-compress');
}