///////////////////////////////////////////////////////////// LOAD LIBS /////////////
var path = require('path'),
	colors = require('colors') ;

///////////////////////////////////////////////////////////// CHANGE WORKING PATH /////////////
process.chdir(path.normalize(__dirname+'/')) ;
GLOBAL.root_path = process.cwd() ;

///////////////////////////////////////////////////////////// TOOLS KIT ///////////////
GLOBAL.tools = require('./server/libs/tools.kit') ;

////////////////////////////////////////////////////////// WELCOME MESSAGE /////////////
var asciimo = require('./server/libs/asciimo').Figlet
async.series([
	function(callback) {
		console.log("\n")
		asciimo.write("G33k", 'Banner', function(art){
			console.log("\n")
			console.log(tools.trim(art).rainbow.bold);
			callback();
		}); 
	},
	function(callback) {
		asciimo.write("PROD", 'starwars', function(art){
			console.log("\n====================================\n")
			console.log(tools.trim(art).rainbow.bold);
			console.log("\n")
			callback();
		}); 
	}
], 

///////////////////////////////////////////////////////////// LOAD APP ///////////////
function() {

	// -> Write waiting message to console
	tools.debug('[>] Load dependencies. Please wait...') ;

	// -> Start application
	var Application = require('./server') ;
	GLOBAL.Core = new Application().start() ;

})
