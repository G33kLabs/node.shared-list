///////////////////////////////////////////////////////////// CONFIG CONTROLLER /////////////
// CONSTRUCTOR
var ConfigController = function(opts) {
	this.settings = _.extend({}, opts); 
	this.settings.configFile = this.settings.path+this.settings.file;
	return this;
}

// EXPORTS MODULE 
module.exports = ConfigController;

// CLASS PUBLIC FUNCTIONS
ConfigController.prototype = {
	init: function(callback) {
		var self = this;
		self.readConfigFile(function(err, res) {
			if ( res ) self.datas = res;
			callback(err, res) 
		});
		return this;
	},
	readConfigFile: function(callback) {
		fs.readFile(this.settings.configFile, 'utf8', function(err, res) {
			if ( res ) res = tools.jsonParse(res); 
			callback(err, res);
		}) ;
		return this;
	},
	writeConfigFile: function(callback) {
		var out = tools.jsonStringify(this.toJSON()); 
		if ( ! out ) return callback("ConfigController :: Config is empty :( Abort config file replacement !"); 
		fs.writeFile(this.settings.configFile, out, 'utf8', function(err, res) {
			callback(err, res);
		}) ;
		return this;
	},
	toJSON: function() {
		return this.datas;
	}
}