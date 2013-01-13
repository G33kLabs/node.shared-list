///////////////////////////////////////// LIBS
var mysql = require('mysql');
var parse = require("url").parse;

///////////////////////////////////////// DATABASE CLASS
module.exports = Backbone.Model.extend({

	// Defaults
	defaults: {
		link: false,
		dump: false,
		models: false,
		reconnect: 5000
	},

	// Init & ask to open connection
	initialize: function(opts, callback) {
		if ( ! this.get('link') ) {
			tools.warning("[!] Load DB : MySql support disabled. No config found in ENV !")
			callback(null, "MySql support disabled : no config found in ENV !")
		}
		else this.open(callback) ;
	},

	// Open connection
	open: function(callback) {
		var self = this;

		// Logs
		var uri_parse = parse(this.get('link')) ;
		tools.log('[>] Open DB : '+uri_parse.protocol+'//'+(uri_parse.auth?'...@':'')+uri_parse.host+uri_parse.path+'...', 'lcyan') ;

		// Create link
		self.db = mysql.createConnection(self.get('link'));

		// Handle Disconnections
		self.handleDisconnect(self.db);

		// Open link
		self.db.connect(function(err) {
			if ( err ) tools.error("ERROR with mysql connection :: "+err.code) ;
			else {
				tools.log('[>] Load DB : Link is now open !') ;
				self.connection_lost = false ;
				self.install() ;
			}
			if ( _.isFunction(callback) ) callback(err) ;
		});

	},

	// Close connection
	close: function() {
		this.db.close(function() {
			tools.log('Database closed properly !');
		})
	},

	// Alias for query
	query: function(query, params, callback) {
		var self = this;
		if ( _.isFunction(params) ) {
			callback = params;
			params = null;
		}
		return self.db.query(query, params, callback) ;
	},

	// Return formated sql
	queryFormat: function(query, params) {
		return this.db.format(query, params) ; 
	},

	// Alias for escape
	escape: function(query) {
		return this.db.escape(query)
	},

	// Create mysql structure if necessary
	install: function(callback) {
		var self = this;

		if ( ! self.get('dump') ) return _.isFunction(callback) ? callback('No dump file to import !') : false;

		async.series({

			// -> Check
			check: function(callback) {
				tools.debug('Check if schema exists...')
				self.db.query('SELECT * FROM usr LIMIT 1', function(err, res, rows) {
					if ( err && err.code == 'ER_NO_SUCH_TABLE' ) callback(null, true); 
					else callback('EXISTS') ;
				})
			},

			// -> At this point, table not yet exists
			read_dump: function(callback) {
				var that = this;
				tools.debug('Read dump file...')
				fs.readFile(self.get('dump'), 'utf8', function(err, res) {
					if ( res ) {
						res = tools.trim(_.reject(res.split("\n"), function(row) {
							return (/^\-\-/).test(row)	
						}).join("\n")); 
						that.dump = res;
					}
					callback(err, res) ;
				})
			},

			// -> Inject sql dump
			import: function(callback) {
				var that = this;
				//console.log(that.dump)
				tools.log('Import sql dump...')
				self.db.query(that.dump, function(err, res) {
					console.log(err, res)
					callback(err, res) ;
				})
			}

		}, 

		// Trigger callback
		function(err, res) {
			console.log(err, res)
			if ( err == 'EXISTS' ) (err = null) && (res = true);
			if ( err ) tools.error(err) ;
			if ( _.isFunction(callback) ) callback(err, res) ;
		})
	},

	// Handle network errors
	handleDisconnect: function(connection) {
		var self = this;

		// Wait reconnection
		var waitReconnectTimer = null;
		var waitReconnect = function() {
			self.connection_lost = true ;
			self.open() ;
			if ( self.get('reconnect') ) {
				if ( waitReconnectTimer ) clearTimeout(waitReconnectTimer) ;
				waitReconnectTimer = setTimeout(function() {
					if (self.connection_lost) {
						tools.warning('Connection still lost.. Retry to connect after 5 seconds of pause...')
						waitReconnect() ;
					}
				}, self.get('reconnect')) ;
			}
		}

		// Bind error
		connection.on('error', function(err) {
			if (!err.fatal) return;
			if (err.code !== 'PROTOCOL_CONNECTION_LOST') { throw err;}
			tools.warning('Re-connecting lost connection: ' + err.stack);
			waitReconnect() ;
		});

		// Bind close (accident or not)
		connection.on('close', function(err) {
			if (err) {
				tools.warning('Re-connecting server close connection: ' + err.stack);
				waitReconnect() 
			} else {
				tools.log('Connection closed normally.');
			}
		});		

	}
})
