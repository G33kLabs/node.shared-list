// -- Set timers
$timers = {} ;

// -- Facebook jQuery plugin
(function( $ ){
	
	// Default settings
	var settings = {
		'facebook_appID'  	: false,
		'facebook_perms'	: null,
		'force'				: false,
		'trigger_prefix'	: 'fb_'
	};
	
	var env = { 
		status: 'notConnected',
		isFan: false,
		isLogged: false,
		location: {},
		session: {}
	} ;
	
	// Methods
	var methods = {
	
		// -- Init Facbook jQuery plugin
		init : function( options ) {

			if ( options ) 
				$.extend( settings, options );					
			
			// Get locale 
			settings.locale = methods.getLocale() ;

			// Install Facebook JS API
			settings.facebook_api_url = document.location.protocol + '//connect.facebook.net/'+settings.locale+'/all.js' ;
			//setTimeout(function() { methods.installJS() ; }, 10000);
			methods.installJS() ;
			
			// Try to Geolocate client
			if ( settings.locate ) {
				if ( typeof $.fn.geolocation == 'function' ) {
					try {
						settings.locate.onSuccess = function(location) {
							methods.triggerAction('onGeolocate', location) ;
						} ;
						settings.locate.onFail = function(error) {
							methods.triggerAction('onGeolocateFail', error) ;
						} ;
						$.geolocation(settings.locate) ;
					} catch(e) {
						$.facebook.log(e) ;
					}
				}
			}
			 
			// Return object
			return this ;
			
		},
		
		// Return settings to api
		getOpt: function(optName) {
			return settings[optName] ;
		},

		// Return settings to api
		getOpts: function() {
			return settings ;
		},
		
		// Trigger an action
		triggerAction: function(action, message) {
			//$.facebook.log(action+' => '+JSON.stringify(message)) ;
			if ( settings.trigger_prefix ) $(document).trigger( settings.trigger_prefix + action, message) ;	
		},
		
		// Return session
		getSession: function() {
			return env.session ;
		},
		
		// Get Status
		getStatus: function() {
			return env.status ;
		},
		
		// Get Fan status
		getFan: function() {
			return env.isFan ;
		},
		
		// Get me
		getMe: function(cb) {
			if ( env.me ) return cb(env.me) ;
			else {
				FB.api('/me', function(data) {
					if ( data ) {
						env.me = data ;
						cb(env.me) ;
					}
				}) ;
			}
		},
		
		// Function to handle Session
		handleSession: function(response) {
			if ( response.status != '' ) env.status = response.status ;
			$.extend(env.session, response) ;
			methods.triggerAction( 'onSessionUpdate', response ) ;

			if ( response && response.status == 'connected' && ! env.isLogged ) {
				env.isLogged = true ;
				methods.triggerAction('onUserLogged', env) ;
			}
			
			$(document).trigger('FacebookReady') ;
		},
		
		// Function to handle likes changes
		handleLikes: function(response) {
			if ( $timers.detectLike ) clearTimeout($timers.detectLike) ;
			$timers.detectLike = setTimeout(function() {
				var appLike = settings.facebook_like_href ;
				try { $.quizz('trackEvent', 'user.isFan:'+(response==appLike?'ok':'no')+'|'+response+"=>"+appLike) ;	} catch(e) {}
				env.isFan = ( response ? true : false )  ;
				methods.triggerAction( 'onEdgeUpdate', response ) ;
			}, 200 );
		},
		
		// Login to facebook
		login: function(opts) {
			opts = $.extend({perms: settings.facebook_perms}, opts) ;
			if ( env.status == 'connected' ) {
				methods.triggerAction( 'onLogin' ) ;
			} else {
				FB.login(function(response) {
	    			methods.handleSession(response) ;
	    			if (response.session) {
	    				methods.triggerAction( 'onLogin' , response) ;
	    			} else {
	    				methods.triggerAction( 'denyPermission', response) ;
	    			}
	    		}, {scope: opts.perms });
			}
			
		},
		
		// Logout from facebook
		logout: function() {
			FB.logout(function(response) {
				methods.triggerAction( 'onLogout' ) ;
			});
		},
		
		// Return if user is fan
		isFan: function(isFan_fn, notFan_fn, likeID) { 
			var isFan = false ;
			likeID = likeID || settings.like_id ;
			FB.api({
				method : 'pages.isFan',
				page_id: likeID
			}, function(response) {
				//console.log(response, likeID) ;
				if(response == false) {
					env.isFan = false ;
					try { notFan_fn(likeID, response) ; } catch(e) {}
				} else {
					env.isFan = true ;
					try { isFan_fn(likeID, response) ; } catch(e) {}
				}
			});
		},
		
		// Init the api
		initAPI: function() {

			// -- Init FB API
			$.facebook.log('|-> Init FB API...') ;
			try {
				FB.init({
					appId  : settings.facebook_appID,
					status : true, // check login status
					cookie : true, // enable cookies to allow the server to access the session
					xfbml  : true  // parse XFBML
				});
			} catch(e) { $.facebook.log('Error during Init : '+e); } ; 
			
			
			// -- Bind sessionChange
			FB.Event.subscribe('auth.sessionChange', function(response) {
				methods.handleSession(response) ;
			});
			
			// -- Bind Like changes
			FB.Event.subscribe('edge.create', function(response) {	
				methods.handleLikes(response) ;
			});
			
			// -- Bind unlike
			FB.Event.subscribe('edge.remove', function(response) {	
				methods.handleLikes(false) ;
			});
			
			// -- AutoResize
			FB.Canvas.setAutoGrow();
			
			// -- Get Session
			FB.getLoginStatus(function(response) {
				methods.handleSession(response) ;
			});
			
			// Load onComplete
			methods.triggerAction( 'onComplete' ) ;

			// Set as loaded
			this.loaded = true;
			
			// -- Upgrade performance data reporting
			try {
				FB.Canvas.setDoneLoading(function(resultTime) {
					//$.facebook.log('Ready after : '+resultTime.time_delta_ms) ;
				});
			} catch(e) {}
			
		},
		
		// Install Facebook JS API and bind his load
		installJS: function() {
			
			var match = false;
			var _s = this ;
			$.each($('script') , function(key, val)	{
				if ( typeof $(val).attr('src') != 'undefined' ) 
					if ( $(val).attr('src').match(settings.facebook_api_url) ) match = true ;
			}) ;
			if ( this.loaded ) {
				$.facebook.log('|-> FB loader is already Loaded...') ;
				_s.onComplete() ;
			} else {
				$.facebook.log('|-> Install FB loader JS API...') ;
				window.fbAsyncInit = function() { methods.initAPI() ; };
				(function() {
					$.facebook.log('|-> Load API File...') ;
					var e = document.createElement('script');
					e.type = 'text/javascript';
					e.src = settings.facebook_api_url ;
					e.async = true;
					var parent = document.getElementById('fb-root') ;
					if ( ! parent ) {
						parent = $('<div id="fb-root"></div>') ;
						parent.prependTo($('body')) ;
						parent = parent.get(0) ;
					}
					parent.appendChild(e);
				}());
			}
		
		},

		// -- Get locale
		getLocale: function() {
		
			// -- Current language
			var locale = '' ;
			if ( settings.locale ) {
				locale = settings.locale
			} else if ( navigator ) {
			    if ( navigator.language ) {
			        locale = navigator.language;
			    }
			    else if ( navigator.browserLanguage ) {
			        locale = navigator.browserLanguage;
			    }
			    else if ( navigator.systemLanguage ) {
			        locale = navigator.systemLanguage;
			    }
			    else if ( navigator.userLanguage ) {
			        locale = navigator.userLanguage;
			    }
			}
			
			// -- All facebook supported languages
			// -> https://api.facebook.com/method/intl.getTranslations?locale=all&access_token=xxx&format=json
			this._locales = ["ca_ES","cs_CZ","cy_GB","da_DK","de_DE","en_US","eu_ES","en_PI","en_UD","es_LA","es_ES","fi_FI","fr_FR","gl_ES","hu_HU","it_IT","ja_JP","ko_KR","nb_NO","nn_NO","nl_NL","fy_NL","pl_PL","pt_BR","pt_PT","ro_RO","ru_RU","sk_SK","sl_SI","sv_SE","th_TH","tr_TR","ku_TR","zh_CN","zh_HK","zh_TW","fb_LT","af_ZA","sq_AL","hy_AM","az_AZ","be_BY","bn_IN","bs_BA","bg_BG","hr_HR","en_GB","eo_EO","et_EE","fo_FO","fr_CA","ka_GE","el_GR","hi_IN","is_IS","id_ID","ga_IE","la_VA","lv_LV","lt_LT","mk_MK","ms_MY","ne_NP","pa_IN","sr_RS","sw_KE","tl_PH","ta_IN","te_IN","ml_IN","uk_UA","vi_VN","ar_AR","he_IL","fa_IR","ps_AF"] ;
			
			// -- Fix variants and set country
			var fb_locale ;
			fb_locale = _.find(this._locales, function(lang) {
				return lang.toLowerCase() == locale.toLowerCase() ;
			}); 
			
			// -- Set default if not finded
			if ( ! fb_locale ) {
				fb_locale = 'en_US';
			}
			//console.log(fb_locale, settings.locale, navigator.language)
			
			return fb_locale ;
		
		},

		show : function( ) { 
			$.facebook.log(settings) ;
		}
	};
	
	// PLugin Call
	$.fn.facebook = function( method ) {
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.facebook' );
		}    
	};
	
	$.facebook = $(document).facebook ;
	
	// Log function
	$.facebook.log = function(txt) {
    	try {
    		console.log('facebook API: '+JSON.stringify(txt));
	    } catch(e) { }
	} ;


})( jQuery );
