#!/usr/local/bin/node

var os = require('os'),
    path = require('path'),
	request = require('request'),
    exec = require('child_process').exec;

process.chdir(path.normalize(__dirname+'/../')) ;
GLOBAL.root_path = process.cwd() ;

// Load tools
GLOBAL.tools = require(root_path+'/libs/server/tools.kit.js') ;

// Sert logFile where datas will be stored
var logFile = root_path+'/logs/yoctohub.log'; 

// Will post sensors data to this url
var postAPI = 'http://192.168.1.10:4000/api/virtualhub/';

// Get yoctoLib path
var yoctoPath = root_path+'/libs/server/YoctoLib/';
var platform = os.platform() ;
var arch = os.arch();

if ( platform == 'darwin' ) yoctoPath += 'osx/';
else if ( platform == 'linux' ) yoctoPath += 'linux/';

if ( arch == 'arm' ) yoctoPath += 'armhf/';

//console.log(os.arch(), os.platform(), yoctoPath+'YTemperature all get_advertisedValue')

// Function to request temp on sensors and store values into log file
function updateTemp() {
	var startExec = Date.now(); 
	exec('sudo '+yoctoPath+'YTemperature all get_advertisedValue', function(err, datas) {
		if ( err ) {
			tools.error('[!] Error :: '+err) ;
			return false;
		}

		// Parse rows for each element
		var rows = datas.split("\n"),
			els = [],
			jsonEls = {} ;

		// Build a '|' separated line for each items
		_.each(rows, function(row) {
			if ( ! row || row == '' ) return;
			var match = row.match(/(\w+)\:\ (.*) \= (.*)/);
			if ( ! match ) return tools.error('[!] Row match with nothing : '+row);

			var status = match[1]; 
			var model = match[2]; 
			var value = match[3];
			var serial = model.split('.')[0] ;
			var func = model.split('.')[1] ;

			var out = Date.now()+'|'+serial+'|'+func+'|'+value+'|'+(Date.now()-startExec); 
			els.push(out) ;

			jsonEls[serial+'#'+func] = value; 

		})

		// Add error if no elements found
		if ( ! els.length ) {
			els.push(Date.now()+'|ERROR|'+'Error while getting update...') 
		}

		// Append valued to file if items found
		tools.createFullPath(logFile, function() {
			fs.appendFile(logFile, els.join("\n")+"\n", function (err) {
				if (err) throw err;
				tools.log('Sensor data logged to '+logFile+' !');
			});
		}); 

		// Send result to http callback
		if ( postAPI ) {
			tools.log('[>] Send callback to '+postAPI)
			request({
				url: postAPI,
				form: jsonEls,
				method: 'POST'
			}, function(err, res, body) {
				tools.log('Callback : '+body)
			}) ;
		}

		//console.log( els)
	})

}

updateTemp(); 

/*
// -> Run every 15 seconds
setInterval(function() {
	updateTemp(); 
}, 30000) ;

// -> Kill after 59 seconds ( cron runs it every minutes )
setTimeout(function() {
	process.exit(0); 
}, 59000)

*/