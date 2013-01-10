///////////////////////////////////////////////////////////// IMPLEMENT SHAREJS AS AN EXPRESS MODULE /////////////
var sharejs = require('share');
var parse = require("url").parse;

module.exports = function(server, app) {
	tools.debug("Load WebServer addon : sharejs") ;

	var redisToGo = process.env.REDISTOGO_URL ? parse(process.env.REDISTOGO_URL) : parse("redis://127.0.0.1:6379"); 

	tools.log('Open connexion to redis : '+redisToGo.protocol+'//'+redisToGo.host+'...');

	sharejs.server.attach(server, {
		db: {
			type: 'redis',
			hostname: redisToGo.hostname,
			port: redisToGo.port,
			auth: redisToGo.auth,
		},
		browserChannel: {cors: '*'}
	});

}
