///////////////////////////////////////// LIBS
var mysql = require('mysql');
var models = require('./model.js')

///////////////////////////////////////// DATABASE CLASS
var db_class = Backbone.Model.extend({

	// Defaults
	defaults: {
		link: process.env.MYSQL_DATABASE_URL,
		dump: root_path+'/server/controllers/db/create.sql'
	},

	// Init & ask to open connection
	initialize: function() {
		this.set('models', models) ;
		this.open() ;
	},

	// Open connection
	open: function() {
		var self = this;

		// Logs
		tools.log('Open DB :: '+this.get('link'), 'lcyan') ;

		// Create link
		self.db = mysql.createConnection(self.get('link'));

		// Handle Disconnections
		self.handleDisconnect(self.db);

		// Open link
		self.db.connect(function(err) {
			tools.log('Database link is now open !') ;
			self.install() ;
		});

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
		async.series({

			// -> Check
			check: function(callback) {
				self.db.query('SELECT * FROM usr LIMIT 1', function(err, res, rows) {
					if ( err && err.code == 'ER_NO_SUCH_TABLE' ) callback(null, true); 
					else callback('EXISTS') ;
				})
			},

			// -> At this point, table not yet exists
			read_dump: function(callback) {
				var that = this;
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
			if ( err == 'EXISTS' ) (err = null) && (res = true);
			if ( err ) tools.error(err) ;
			if ( _.isFunction(callback) ) callback(err, res) ;
		})
	},

	// Handle network errors
	handleDisconnect: function(connection) {
		var self = this;

		// Bind error
		connection.on('error', function(err) {
			if (!err.fatal) return;
			if (err.code !== 'PROTOCOL_CONNECTION_LOST') { throw err;}
			tools.warning('Re-connecting lost connection: ' + err.stack);
			self.open() ;
		});

		// Bind close (accident or not)
		connection.on('close', function(err) {
			if (err) {
				tools.warning('Re-connecting server close connection: ' + err.stack);
				self.open() ;
			} else {
				tools.log('Connection closed normally.');
			}
		});		

	}
})

///////////////////////////////////////// EXPORTS CLASS
module.exports = new db_class() ;