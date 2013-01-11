///////////////////////////////////////////////////////////// IMPLEMENT SHAREJS AS AN EXPRESS MODULE /////////////
var sharejs = require('share');
var parse = require("url").parse;

module.exports = function(server, app) {
	tools.debug("Load WebServer addon : sharejs") ;
	sharejs.server.attach(server, {
		db: {
			type: 'mysql'
		},
		browserChannel: {cors: '*'}
	});
}