#!/usr/local/bin/node

/*
# This script will setup a fresh AW12 applicance module to the housecode in args.
# When you unpack the module, default housecode is A1
# Anyway, at startup a reset procedure is possible. Just follow instructions...
#
# DE LA RUE Guillaume <delarueguillaume@gmail.com>
#
*/

///////////////////////////////////////////////////////////// LOAD LIBS /////////////
var exec = require('child_process').exec,
    async = require('async'),
    prompt = require('prompt'),
    readline = require('readline'),
    optimist = require('optimist') ;

///////////////////////////////////////////////////////////// TOOLS KIT /////////////
GLOBAL.tools = require('../libs/tools.kit') ;

///////////////////////////////////////////////////////////// ARGUMENTS /////////////
prompt.start();
prompt.override = optimist.argv;
prompt.message = '' ;
prompt.delimiter = '' ;

///////////////////////////////////////////////////////////// EXEC COMMAND /////////////
var exec_cmd = function(housecode, state, callback) {
	var cmd = 'heyu wait; heyu '+state+' '+housecode;
	tools.debug(' > '+cmd) ;
	exec(cmd, function(err, res) {
		setTimeout(function() {
			callback(null, res) 
		}, 0) ;
	}) ;
}

var exec_sequence = function(housecode, states, callback) {
	async.forEachSeries(states, function(state, callback) {
		exec_cmd(housecode, state, callback)
	}, function(err, res) {
		callback(err, res); 
	});
}

///////////////////////////////////////////////////////////// MAIN /////////////
async.series({

	// Get arguments
	'args': function(callback) {
		var self = this;
		prompt.get([
			{
				"description": 'Enter the housecode =>',
				"name": 'housecode',
				"message": "Must be C5 for example",
				"default": optimist.argv ? optimist.argv._[0] : null,
				"required": true
			},
			{
				"description": 'Default housecode =>',
				"name": 'initcode',
				"message": "The actual housecode of the applicance",
				"default": 'A1'
			}
		], function (err, result) {
			if ( err ) return callback("Abort configuration...");
			result.housecode = result.housecode.toUpperCase();
			result.initcode = result.initcode.toUpperCase();
			self.args = result; 
			callback(err, result) ;
		});		
	},

	// Stop Node.x10
	'stop_main': function(callback) {
		tools.log("Stop Node.x10...", "lcyan") ;
		exec("sudo /etc/init.d/Node.x10 stop", function(err, res) {
			tools.log("Node.x10 monitor stopped !"); 
			setTimeout(function() {
				callback(null, res) 
			}, 0) ;
		}) 
	},


	// Stop heyu monitor
	'stop_monitor': function(callback) {
		tools.log("Stop heyu monitor...", "lcyan") ;
		exec("sudo /etc/init.d/heyu stop", function(err, res) {
			tools.log("Heyu monitor stopped !"); 
			setTimeout(function() {
				callback(null, res) 
			}, 0) ;
		}) 
	},	

	// Display init message
	'message': function(callback) {
		var self = this;
		tools.log("Device address will be : "+self.args.housecode+"\n", "lcyan") ;
		tools.log("Please turn off then on manually the device...");
		tools.warning("You've 30 seconds after device turned on... ");

		var rl = readline.createInterface({ input: process.stdin, output: process.stdout });
		rl.question("Press <Enter> when you're ready...", function(answer) {
			rl.close();
			callback() ;
		});
	},

	// Init device
	'init_device': function(callback) {
		var states = [], numCommands = 2, initCode = 'P16' ;
		tools.log("Send init orders to "+initCode+"...", "lcyan") ;
		for ( var i=0 ; i < numCommands ; i++ ) { states.push('on') }
		exec_sequence(initCode, states, function(err, res) {
			tools.log("Device address is now A1 ! Wait some seconds..."); 
			setTimeout(function() {
				callback(err, res); 
			}, 5000) ;
		});
	},

	// Turn prgm mode on ( send a sequence of 'on'/'off' orders to actual init housecode )
	'enter_prgm' :function(callback) {
		var self = this, states = [], numCommands = 5 ;
		tools.log("Enter device "+self.args.initcode+" in prgm mode...", 'lcyan'); 
		for ( var i=0 ; i < numCommands ; i++ ) { states.push('on', 'off') }
		exec_sequence(self.args.initcode, states, function(err, res) {
			tools.log("Device is now in program mode ! Wait some seconds..."); 
			setTimeout(function() {
				callback(err, res); 
			}, 5000) ;
		});
	},

	// Set address ( send sequence 'on' as many times it needs to set house letter )
	'set_address' :function(callback) {
		var self = this, states = [];
		tools.log("Set device housecode : "+self.args.housecode+"...", 'lcyan')

		// How many times we must send order ? A = 1 | B = 2 | C = 3 times...
		_.find('ABCDEFGHIJKLMNOP', function(letter){
			states.push('on') ;
			return letter == self.args.housecode[0]
		})

		// Send config orders
		exec_sequence(self.args.housecode, states, function(err, res) {
			tools.log("Device housecode is now "+self.args.housecode+" ! Wait some seconds..."); 
			setTimeout(function() {
				callback(err, res); 
			}, 2000) ;
		});

	},

	// Complete configuration ( send a sequence of 'on'/'off' orders to complete configuration )
	'complete' :function(callback) {
		var self = this, states = [], numCommands = 5 ;
		tools.log("Finish configuration : "+self.args.housecode+"...", 'lcyan')
		for ( var i=0 ; i < numCommands ; i++ ) { states.push('on', 'off') }
		exec_sequence(self.args.housecode, states, function(err, res) {
			tools.log("Device configuration is complete "+self.args.housecode+" ! "); 
			setTimeout(function() {
				callback(err, res); 
			}, 2000) ;
		});
	},

}, 

// That's all folks !
function(err, res) {
	if ( err ) tools.error(err);
	else {
		tools.log('Success !')
	}

	// Restart heyu monitor
	tools.log("Start heyu monitor...", "lcyan") ;
	exec("sudo /etc/init.d/heyu start", function(err, res) {
		tools.log('Heyu monitor restarted !')
	}) ; 

	// Restart heyu monitor
	tools.log("Start Node.x10 monitor...", "lcyan") ;
	exec("sudo /etc/init.d/Node.x10 start", function(err, res) {
		tools.log('Node.x10 restarted !')
	}) ; 
})
