///////////////////////////////////////////////////////////// IMPLEMENT SHAREJS AS AN EXPRESS MODULE /////////////
var sharejs = require('share');

module.exports = function(server, app) {
	tools.debug("Load WebServer addon : sharejs") ;
	sharejs.server.attach(server, {
		db: {
			type: process.env.MYSQL_DATABASE_URL ? 'mysql' : 'redis'
		},
		browserChannel: {cors: '*'}
	});
}