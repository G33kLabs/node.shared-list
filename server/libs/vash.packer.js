/*
 * vash.packer.js - Javascript node compressor
 * http://github.com/G33kLabs/vash.packer.js
 */

/*global define: false*/

/* Daemon libs */
var _ = require('underscore') ,
	async = require('async'),
	watchr = require('watchr')
	mkdirp = require('mkdirp')
	colors = require('colors') ;

/* Packer Libs */
var htmlPacker = require('html-minifier').minify,
	jsParser = require("uglify-js").parser,
	jsPacker = require("uglify-js").uglify,
	cssPacker = require('uglifycss') ;

(function (exports) {
	if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
		module.exports = exports;
	} else {
		window.packer = exports;
	}
}(function () {
  	var exports = {};

  	////////////////////////////////////////////////////////////// DAEMONIZE ///////////
  	var settings = null; 
  	var watchedFiles = null;

  	/* Public Exports of the daemon */
  	exports.daemon = function(opts, callback) {
  		settings = _.extend({
  			live: false,
  			manifest: false,
  			minify: true,
  			public_path: null,
  			tmp_path: null,
  			css: [],
  			js: []
  		}, opts);
  		loadFiles(callback); 
  	} ;

  	/* Load and survey files */
  	var loadFiles = function(callback) {

  		// -> Check settings
  		if ( ! settings.public_path ) throw "You need to specify a public_path ! ";
  		if ( ! settings.tmp_path ) throw "You need to specify a tmp_path ! ";

  		// -> Read each files
  		var self = this;
  		var files = _.map(_.union(settings.css, settings.js), function(file) {
  			return settings.public_path+file;
  		}) ; 

  		// -> Survey changes on files
		watchr.watch({
		    paths: files,
		    interval: 1000,
		    listener: function(eventName, filePath, fileCurrentStat, filePreviousStat){
		        onFileChange(arguments);
		    },
		    next: function(err, watcher){
		        if (err)  throw err;
		        watchedFiles = watcher;
		        async.forEachSeries(['css', 'js'], function(type, callback) {
		        	buildOuput(type, callback); 
		        }, function() {
		        	tools.log('[>] Minification & watching setup successfully');
		        	callback(err, true); 
		        })
		    }
		});		
  	} ;

  	/* On File change */
  	var onFileChange = function(event){
  		var eventName = event[0] ;
  		var filePath = event[1] ;
  		var fileCurrentStat = event[2] ;
  		var filePreviousStat = event[3] ;
  		console.log('a watch event occured:', eventName, filePath,  tools.extension(filePath))
  		//console.log('a watch event occured:', arguments, tools.extension(filePath));
  		if ( ! filePreviousStat || fileCurrentStat.mtime!=filePreviousStat.mtime ) { 
  			buildOuput(tools.extension(filePath)) ;
  		}
  	};   

  	/* Assembly files of a certain type */
  	var buildOuput = function(type, callback) {
  		var files = settings[type];
  		var content = []; 

  		// No group for this type of files...
  		if ( ! files ) {
  			return tools.error("Packer::buildFile :: Type '"+type+"' is not recognized...") ;
  		}

  		// Logs
  		tools.debug('Build '+settings[type+'_out']+'...') ;

  		// Read every files in the group
  		async.forEachSeries(files, function(file, callback) {

  			// Check if packed version exists and is up to date
  			var packedFilePath = settings.tmp_path+tools.md5(file)+'.'+type;
  			var packedFile = null;
  			var sourceFile = _.find(watchedFiles, function(_file) {
  				return (new RegExp(file)).test(_file.path); 
  			}); 

            // If source file not watched (File does not exists)
            if ( ! sourceFile ) {
                tools.error("Packer::buildFile :: File "+file+" was not found...") ;
                return callback(null, true) ;
            }

            // Read and pack file
  			async.series([
  				function(callback) {
		  			fs.stat(packedFilePath, function(err, res) {
  						packedFile = err ? null : res ;
		  				callback() ;
		  			})
  				},
  				function(callback) {

  					// If file is already packed and up to date
  					if ( packedFile && (packedFile.mtime >= sourceFile.stat.mtime) && false ) {
						fs.readFile(packedFilePath, 'utf8', function(err, res) {
							if ( res ) content.push("/* Cached version : "+file+" */\n"+res); 
							else throw "Packer::buildFile :: File "+file+" was not found..." ;
							callback(); 
						})  						
  					}

  					// Else file is not the last or doesn't exists : regenerate it !
  					else {
  						tools.debug('[>] Refresh file :: '+sourceFile.path) ;
  						fs.readFile(sourceFile.path, 'utf8', function(err, res) {
  						    var body = res;
							if ( body ) {

								// No compression if filename contains 'min.js' or 'min.css'
								if ( ! (new RegExp("min."+type+"$")).test(sourceFile.path) ) {
									  if ( type == 'css' ) body = exports.packCSS(body) ;
  									if ( type == 'js' && ! process.env.DEV ) body = exports.packJS(body)+';' ;
  								}

  								// Create temp dir and write packed (or not) file
  								mkdirp(settings.tmp_path, function(err, res) {
  									fs.writeFile(packedFilePath, body, 'utf8', function(err, res) {
	  									content.push("\n/* Packed version : "+file+" */\n"+body); 
										callback(); 
  									});
  								})
							}
							else throw "Packer::buildFile :: File "+file+" was not found..." ;
							
						})  	
  					}
  					
  				}
  			], function(err, res) {
  				callback(err, res); 
  			}); 

		}, 

  		// Receive concatened files
  		function(err, res) {
  			var output = '',
  				outputPath = settings.public_path+settings[type+'_out'] ; 

  			tools.log('[>] Write minified content to :: ' + outputPath); 

  			mkdirp(path.dirname(outputPath), function(err, res) {
  				content = content.join("\n"); 
	  			fs.writeFile(outputPath, content, 'utf8', function(err, res) {
	  				if ( _.isFunction(callback) ) callback(null, true) ;
	  			})
  			})
  			
  		})
  	}; 

  	////////////////////////////////////////////////////////////// PACK METHODS ///////////
	/* Pack CSS content */
	exports.packCSS = function(content) {
		return cssPacker.processString(content) ;
	} ;

	/* Pack HTML content  */
	exports.packHTML = function(content) {
		return htmlPacker(content, { removeComments: true, collapseWhitespace: false, removeEmptyAttributes: true }) ;
	} ;

	/* Pack JS content */
	exports.packJS = function(content, itemPath) {

		/* Try to parse content */
		try {
			var ast = jsParser.parse(content); /* parse code and get the initial AST */
			ast = jsPacker.ast_mangle(ast); /* get a new AST with mangled names */
			ast = jsPacker.ast_squeeze(ast); /* get an AST with compression optimizations */
		} 

		/* Report error */
		catch(e) { 	
			
			/* Set a compile error flag */
			this.compileError = true ;

			/* Output error */
			console.log('-------------------------') ;
			if ( itemPath ) {
				console.log(" /* Path : "+itemPath+" */ ");
			}
			console.log(content.split("\n").slice(e.line-10, e.line-1).join("\n")) ;
			console.log(" /******** "+e.line+" >> "+e.message+" ********/") ;
			console.log((content.split("\n").slice(e.line-1, e.line).join("\n"))) ;
			console.log(" /***********************************************************/") ;
			console.log(content.split("\n").slice(e.line, e.line+10).join("\n")) ;
			
			/* Say something (designed for OSX) */
			try {
				require('child_process').exec('say -v Alex -r 200 "Houston ? Yeah a problem in code..."') ;	
			} catch(e) {}
		} 

		return jsPacker.gen_code(ast); // compressed code here
		
	} ;

  	return exports;
}()));