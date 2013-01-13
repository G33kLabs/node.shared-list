///////////////////////////////////////////////////////////// WEB SERVER /////////////
// Load Express & Redis
var express = require('express'),
	connect = require('connect'),
    RedisStore = require('connect-heroku-redis')(connect);

// Load routes
var Routes = require('../../routes') ;

// Create Express Server
var app = express() ;
var options = {};

// Create server
var server = connect(app); 

///////////////////////////////////////////////////////////// WEB API /////////////
module.exports = Backbone.Model.extend({

	defaults: {
		public_path: root_path+'/public/static/',
		view_path:  root_path+'/public/views/',
		upload_path: root_path+'/public/uploads/',
		user_path: root_path+'/public/users/'
	},

	start: function(callback) {

		var self = this,
			Config = Core.config(),
			settings = self.toJSON();

		// Add session && router support 
		//app.use(express.favicon(self.get('public_path')+'favicon.ico')); 
		//app.use(express.logger()) ;
		app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
		app.use(express.cookieParser());
		app.use(express.bodyParser());
		app.use(express.errorHandler());
		app.use(express.methodOverride());

		// Configure session
		app.use(express.session({
		    secret: Config.Session.secret, 
		    key: Config.Session.cookname, 
		    cookie: Config.Session.cookoptions, 
		    store: new RedisStore
		}));

		// View helper
		app.configure(function() {
			app.use(express.static(settings.public_path))
		    app.set('view engine', 'html');
		    app.set('layout', 'layout') // rendering by default
			app.set('views', settings.view_path);
		    app.engine("html", require('hogan-express'));
		}); 

		// Add locales support
		app.use(function(req, res, next) {
			Core.Controllers.i18n.request(req, res, next) ;
		});
		
		// Bind routes
		_.each(Routes, function(route, name) {
			tools.debug('Bind route :: '+name+' :: '+route.path) ;
			route.type = (route.type || 'get').toLowerCase() ;
			app[route.type](route.path, route.exec) ;
		})

		// Add server addons
		var addons = require('../../addons') ;
		_.each(addons, function(addon) {
			addon(server, app) ;
		})

		// Start server
		server.listen(Config.Server.port);
		tools.log(' [*] WebServer STARTED : http://'+Config.Server.host+':'+Config.Server.port+'/', 'lcyan') ; 

		// Say that server is loaded
		if ( _.isFunction(callback) ) callback(null, this) ;

	}
})
