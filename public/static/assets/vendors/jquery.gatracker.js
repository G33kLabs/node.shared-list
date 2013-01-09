(function($){
	$.gaTracker = {

		// To store the Google Analytics Code
		code: false,
		
		// Log function
		log: function(txt) {
			try {
				console.log(txt) ;
			} catch(e) {} ;
		},

		// Add external callback
		onTrack: function(path) {},
		
		// Track View
		track: function(url) {
			if ( 'undefined' == typeof _gat ) return false;
			var self = this ;
			if ( self.code ) {
				try { var pageTracker = _gat._getTracker(self.code); } catch(e) { var pageTracker = {}; } ;
				if ( typeof url != 'undefined' ) {
					if ( url.indexOf('http://') == 0 ) 
						url = '/'+url.replace('http://', '').split('/').slice(1).join('/') ;
					$.gaTracker.log('analytics API: track : '+url);
					if ( $.isFunction(self.onTrack) ) self.onTrack(url) ;
					pageTracker._trackPageview(url);	
				} else {
					$.gaTracker.log('analytics API: track current page');
					if ( $.isFunction(self.onTrack) ) self.onTrack(window.location.pathname) ;
					pageTracker._trackPageview();		
				}
			} else {
				$.gaTracker.log('analytics API: Google Analytics Tracker is not ready') ;
			}
		},
		
		// Init GA
		init: function(code, url) {
			$.gaTracker.log('analytics API: Init Async JS');
			var self = this ;
			if ( typeof code != 'undefined' && this.code === false ) this.code = code ;
			if ( ! this.code ) $.gaTracker.log('analytics API: Google Analytics UA must be entered') ;
			else {
				try{
					// determine whether to include the normal or SSL version
					var gaURL = (location.href.indexOf('https') == 0 ? 'https://ssl' : 'http://www');
					gaURL += '.google-analytics.com/ga.js';
			
					// include the script
					$.getScript(gaURL, function(){
						self.track(url) ;
					});
				} catch(err) {
					// log any failure
					$.gaTracker.log('analytics API: Failed to load Google Analytics:' + err);
				}
			}
		}
	};
})(jQuery);