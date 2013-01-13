///////////////////////////////////////////////////////////// LOAD DEPENDENCIES /////////////
var colors = require('colors');
var Packer = require('./libs/vash.packer') ;
var Controllers = require('./controllers') ;

///////////////////////////////////////////////////////////// LOAD APPLICATION /////////////
var Application = function() {
	this.Controllers = Controllers; 
	this.loaded = false;
	return this;
}

module.exports = Application;

Application.prototype = {

	/////////////////////////////////// INIT //////////
	start: function(callback) {

		var self = this; 

		// Log init Start
		tools.log('Start Application...')

		// Async loading
		async.series({

			// -> Load config
			Config: function(callback) {
				self.Controllers.config = self.loadConfig(callback); 
			},

			// -> Open database
			OpenDB: function(callback) {
				self.loadDB(callback) ;
			},

			// -> Load locale Controller
			Locale: function(callback) {
				self.loadLocales(callback) ;
			},

			// -> Start WebServer
			StartWWW: function(callback) {
				self.loadWWW(function(err, res) {
					if ( res ) self.Controllers.www = res;
					callback(err, true) ;
				});
			},

			// -> Pack static files
			PackStatic: function(callback) {
				self.livePacker(callback);
			}		

		}, 

		// Application is loaded !
		function(err, res) {
			if ( err ) tools.error("[!] Error while loading application :: "+err) ;
			else {
				tools.log("[ ] =======================", 'lcyan');
				tools.log("[ ] Application is Loaded !", 'lcyan');
				tools.log("[ ] =======================", 'lcyan');
			}

			// Display config
			console.log(self.config())

			// Report that app is running now
			self.loaded = true; 

			// Trigger main callback
			if ( _.isFunction(callback) ) callback(err, res);
		})	

		// Chain
		return this;
			
	},

	/////////////////////////////////// CONFIG //////////
	// Load
	loadConfig: function(callback) { 
		tools.debug('Load Config...')
		return (new Controllers.Config({
			path: root_path+'/config/',
			file: 'config.js'
		})).init(function(err, res) {
			if ( res ) tools.log('[>] Load Config : OK')
			callback(err, res) ;
		}) ;
	},

	// Store
	writeConfig: function(callback) { 
		this.Controllers.config.writeConfigFile(function(err, res) {
			if ( err ) tools.error('[!] Write Config :: '+err);
			else tools.log('[>] Write Config :: Ok');
			callback(err, res)
		}) ;
	},

	// Get
	config: function() {
		return this.Controllers.config ? this.Controllers.config.toJSON() : null; 
	},

	/////////////////////////////////// DATABASE //////////
	loadDB: function(callback) {
		tools.debug('Load DB...')
	    GLOBAL.db = new Controllers.db({
	    	link: process.env.MYSQL_DATABASE_URL,
	    	//dump: root_path+'/config/dump.sql',
			//models: require(root_path+'/config/model.js')
	    }, callback) ;
	},

	/////////////////////////////////// Locales //////////
	loadLocales: function(callback) {
		tools.debug('Load i18n...')
		this.Controllers.i18n = new Controllers.locale(this.config().lang, callback) ;
	},

	/////////////////////////////////// WWW //////////
	// Load
	loadWWW: function(callback) {
		tools.debug('Load Webserver...');
		var webserver = new Controllers.www(this.config) ;
		webserver.start(function(err, res) {
			if ( res ) tools.log('[>] Load WebServer : OK')
			callback(err, res) ;
		}); 
		return webserver ;
	},

	// Live Packer
	livePacker: function(callback) {
		var self = this;
		tools.debug('Start live assets builder...');
		Packer.daemon(_.extend({
			manifest: 'cache.manifest',
			public_path: self.Controllers.www.toJSON().public_path,
			tmp_path: root_path+'/tmp/packed/',
			css_out: 'packed/app.minify.css',
			js_out: 'packed/app.minify.js',
		}, Core.config().Static), callback) ;
	}
}