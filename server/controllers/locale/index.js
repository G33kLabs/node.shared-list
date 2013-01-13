//////////////////////////////////////////////////// INTERNATIONALIZATION CONTROLLER /////
var fs = require("fs"),
	watchr = require('watchr') ;

module.exports = Backbone.Model.extend({

	// Defaults
	defaults: {
		supported: ['en_US'],
		codes: require('./country.json'),
		path: root_path+'/locales/',
		tpl_path: root_path+'/public/views/',
		tpl_ext: '.html',
		otag: '{{(lang|&lang)',
		ctag: '}}'
	},

	// Init controller
	initialize: function(opts, callback) {
		var self = this;

		// Start
		tools.debug('i18n supported : '+JSON.stringify(this.get('supported'))+' ...') ;

		// Build languages files
		this.build_translation(callback) ;

	},

	// Handle user http request
	request: function(req, res, next) {

		// Don't compute assets
		if ( /\.(js|css|png|ttf|ico)$/.test(req.path) ) {
			next(); 
			return;
		}
		
		// Try to get best one language 
		var self = this;
		var locales = [] ;
		var supported = self.get('supported') ;
		var default_lang = supported[0] ;
		var best_lang = null;
		var req_lang = req.headers["accept-language"] ;

		// Change path if '/fr/' or '/fr_FR/'
		var reg = null;
		var current_path = req.path ;
		_.each(self.getSupported(), function(lang) {
			reg_long = new RegExp('^/'+lang.long+'/');
			reg_short = new RegExp('^/'+lang.short+'/');
			if ( reg_short.test(current_path) || reg_long.test(current_path) ) {
				req.session.locale = lang.long;
				current_path = current_path.replace(reg_long, '/').replace(reg_short, '/');
				//tools.warning('Virtual Redirect for language '+lang.long+'/'+lang.short+'... | '+current_path) ;
				req.url = current_path ;
			}
		})

		// Override if lang is setted for session
		if ( req.session.locale ) {
			req_lang = req.session.locale;
		}

		// Split the nav lang
		var nav_lang = (req_lang||default_lang).split(',') ;

		// Parse navigator languages possibilities
		_.each(nav_lang, function(lang) {
			lang = lang.split(';') ;
			locales.push({
				lang: lang[0].replace('-', '_'),
				score: lang[1] ? parseFloat((lang[1]).replace('q=', '')) : 1	
			})
		})

		// Sort navigator locales by score
		locales = _.sortBy(locales, function(locale) {
			return -locale.score;
		}) ;

		// Choose the best supported one
		_.each(locales, function(locale) {
			if ( best_lang ) return false;
			_.each(supported, function(lang) {
				if ( best_lang ) return false;
				if ( locale.lang == lang ) best_lang = lang; 
			})
		}); 

		// Set default if lang not found
		if ( ! best_lang ) best_lang = default_lang;

		// Add locals with the best_lang for templates
		res.locals = res.locals || {} ;
		res.locals.lang = self.translations[best_lang] ;
		req.locale = best_lang; 

		// Debug
		//tools.log("i18n request :: "+req.url) ;
		
		// Next route
		next() ;

	},

	// Translate (keyword to translate, long code)
	translate: function(key, lang) {

		// Something's wrong...
		if ( ! lang || ! this.translations[lang] ) return key;

		// Get already the translation
		if ( this.translations[lang][key] ) return this.translations[lang][key] ;

		// Add to locales if in development mode
		if ( process.env.DEV ) {
			this.add_locals = this.add_locals || {} ;
			this.add_locals[key] = key;
			tools.warning("Dev i18n :: add keyword to files :: "+key+'...') ;
			this.build_translation() ;
		}

		// Return only key
		return key ;

	},

	// Return supported langs
	getSupported: function() {
		var self = this, support = []; 
		_.each(this.translations, function(d, key) {
			support.push(self.getLocale(key)) 
		})
		return support;
	},

	// Helper for locale
	getLocale: function(locale) {
		var code = locale.toLowerCase().replace('_', '-') ;
		var parse_code = code.split('-') ;
		var country_code = parse_code[1];
		if ( ! country_code ) country_code = parse_code[0];
		if ( parse_code[0] == parse_code[1] ) code = parse_code[0];
		return {
			long: locale,
			short: locale.split('_')[0],
			code: code,
			country: country_code,
			name: this.get('codes')[code]
		};
	},

	// Generate locale files
	build_translation: function(callback) {
		var self = this;
		async.parallel({

			// -> Read templates
			templates: function(callback) {
				self.parseTemplates(callback) ;
			},

			// -> Read locale files
			locales: function(callback) {
				self.parseLocales(callback) ;
			}

		}, function(err, res) {

			// Complete each locales
			self.translations = {}; 
			_.each(res.locales, function(datas, lang) {

				// Get all translations vars
				_.each(res.templates, function(keyword){
					if ( ! datas[keyword] ) datas[keyword] = keyword;
				})

				// Get all translations vars
				_.each(self.add_locals, function(keyword){
					if ( ! datas[keyword] ) datas[keyword] = keyword;
				})

				// Store translations
				self.translations[lang] = datas; 

				// Store file in locales directory
				var file = self.get('path')+lang+'.json' ;
				tools.debug('[>] i18n store '+file+' !') ;
				fs.writeFileSync(file, tools.jsonStringify(self.translations[lang]), 'utf8') ;

			}) ;

			// Next
			tools.log('[>] Load i18n : OK !') ;
			if ( _.isFunction(callback) ) callback(null, true) ;

		})

	},

	// Parse lang vars used in templates
	parseTemplates: function(callback) {
		var self = this;
		async.waterfall([
			function(callback) {
				tools.walk(self.get('tpl_path'), callback)
			},
			function(files, callback) {
				files = _.reject(files, function(file) {
					return ! (new RegExp(self.get('tpl_ext')+'$')).test(file.path)
				})
				callback(null, files) ;
			},
			function(files, callback) {
				var words = {} ;
				var tpl_filter = new RegExp(self.get('otag') + "(=|!|>|\\{|%)?([^\\/#\\^]+?)\\1?" + self.get('ctag') + "+", "g");
				async.forEachSeries(files, function(file, callback) {

					// Survey templates updates in dev mode
					if ( process.env.DEV ) {
						watchr.watch({
				  		    paths: [file.path],
				  		    interval: 1000,
				  		    listener: function(eventName, filePath, fileCurrentStat, filePreviousStat){
				  		    	if ( eventName == 'update' ) {
				  		    		tools.warning("Template change :: "+filePath+'. Rebuild locales...')
				  		    		self.build_translation(); 
				  		    	}
				  		    }
				  		});		
					}

					// Read file content
					fs.readFile(file.path, 'utf8', function(err, res) {

						// Look for tpl_filter
						var matches = res.match(tpl_filter) ;
						if ( matches ) {
							_.each(matches, function(word) {
								word = word.replace(new RegExp('^'+self.get('otag')+'.'), '').replace(new RegExp(self.get('ctag')+'$'), '') ;
								words[word] = true;
							})
						}

						// Next
						callback(); 

					}) ;

				}, function() {
					callback(null, _.keys(words))
				}) ;
			}
		], function(err, words) {
			callback(err, words);
		})
	},

	// Parse locales files
	parseLocales: function(callback) {
		var self = this, locales = {};
		async.forEachSeries(self.get('supported'), function(lang, callback) {
			var file = self.get('path')+lang+'.json' ;
			fs.readFile(file, 'utf8', function(err, res) {
				if ( res && (res=tools.jsonParse(res)) ) locales[lang] = res ;
				else locales[lang] = {}; 
				callback() ;
			})
		}, function(err) {
			callback(err, locales) ;
		}); 
	}

}) ;