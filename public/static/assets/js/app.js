(function() {

	// -> Application UI Helpers
	var ApplicationUI = Backbone.Model.extend({
		defaults: {

		},
		initialize: function() {
			var self = this;

			this.dom = {
				nav: $('#navbar')
			}

			// -> Init websockets communication channel
			//this.initSocketIO() ;

			// -> Load js addon files
			this.loadJSAddons() ;

			// -> Load Google Analytics
			this.loadGA() ;

        	// DISPLAY ERROR MESSAGE FOR UNSUPPORTED DEVICES
	        if ( ! self.isSupported() && (! /^\/admin/.test(window.location.pathname)) )  {
	            var tpl = tools.tpl('tpl_device_not_supported_'+$('#fb-root').data('locale')) ;
	            alert(tpl)
	        }

			// -> Bind window resize
			$(window).on('resize', function() {
				self.onResize() ;
			});

			return this; 
		},

		isSupported: function() {
			return tools.isInputTypeFileImplemented()
		},

		//============================================================= HELPERS
		parse_url: function(url) {
		    var a = document.createElement('a');
		    a.href = url;
		    return a;
		},
		info: function(type, message, manualClose) {
		    $("#alert-area").append($("<div class='alert alert-" + type + " fade in' data-alert><button type='button' class='close' data-dismiss='alert'>×</button><p> " + message + " </p></div>"));
		    if ( ! manualClose ) $(".alert").delay(4000).fadeOut("slow", function () { $(this).remove(); });
		},
		getCurrentTab: function() {
			self.currentTab = $.trim(this.dom.nav.find('ul.nav li.active').text()).toLowerCase() ;
			return self.currentTab;
		},

		//============================================================= LIVE RELOAD DEV
		liveReload: function() {
			setTimeout(function() {
				$('<script src="https://github.com/livereload/livereload-js/raw/master/dist/livereload.js?host=localhost"></script>').appendTo('body')
			}, 1000)
		},

		//============================================================= INIT WEBSOCKETS
		initSocketIO: function() {
			require(["/socket.io/socket.io.js"], function() {
				var socket = io.connect();
				socket.on('news', function (data) {
					//console.log('[>] Socket.io message : '+JSON.stringify(data));
				});					
			})
		},

		//============================================================= LOAD JS ADDONS
		loadJSAddons: function() {
			var self = this; 
			var addons = _.filter(($('#require-loader').data('addon')||'').split('|'), function(url) {
				return url != '' ;
			}) ;
			if ( ! addons.length ) {
				self.show() ;
				return false;
			}

			async.forEachSeries(addons, function(addon, callback) {
				require([addon], function() {
					callback(null) ;	
				})
			}, function() {
				self.show() ;
			}); 
			
		},

		//============================================================= LOAD FACEBOOK API
		loadFB: function() {
			return;
			var fb_root = $('#fb-root') ;

			// Init Facebook API
			$.facebook({
				debug: true,
				facebook_appID: fb_root.data('appid'),
				facebook_perms: fb_root.data('perms'),
				like_id: fb_root.data('likeid'),
				like_url: fb_root.data('likeurl'),
				app_url: fb_root.data('appurl'),
				tab_url: fb_root.data('taburl'),
				go_url: fb_root.data('gourl'),
				locale: fb_root.data('locale'),
				country: fb_root.data('country')
			}) ;

			// -- Scroll to top
			$(document).on('fb_onComplete', function(e, res) {
				if ( (typeof NO_FB_SCROLL=='undefined') || (typeof NO_FB_SCROLL!='undefined' && !NO_FB_SCROLL) ) {
					try { FB.Canvas.scrollTo(0,0) } catch(e) {} ;
				}
				//app.loadSocialPlugins() ;
			})
			
		},

		//============================================================= LOAD ADD THIS SOCIAL PLUGINS
		loadSocialPlugins: function() {

			// -- Abort if no html in page
			if ( ! $('.addthis_toolbox').length ) return false;

			// -- Load AddThis plugin
			setTimeout(function() {
				//console.log('Load Addthis...')
				var e = document.createElement('script');
				e.type = 'text/javascript';
				e.src = '//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-50b79d2b5a93b2f3';
				e.async = true;
				var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(e, s);
			}, 2000); 				
		},

		//============================================================= GOOGLE ANALYTICS TRACKING
		loadGA: function() {
			var code = $('#ga-root').data('code') ;
			var local_pixel = $('#ga-root').data('pixel') ;
			if ( code ) {

				if ( local_pixel ) {
					$.gaTracker.onTrack = function(path) {
						$.ajax({
							url: local_pixel+'?path='+encodeURIComponent(path)+'&isAjax=true&source='+$('#fb-root').data('likeid'),
							type: 'get',
							complete: function() {
								console.log('Tracking sended')
							}
						})
					}
				}

				$.gaTracker.init(code);
			}
		},


		//============================================================= RESPONSIVE CONTENT
		onResize: function() {
			$('.page').each(function() {
				var page = $(this) ;
				page.css({'min-height': $(window).height()-80})
			});
		},

		//============================================================= SHOW CONTENT ON LOAD
		show: function() {
			//this.loadFB() ;
			this.onResize();
		}

	})

	// -> Init application UI
	window.app = new ApplicationUI() ;

}).apply(this) ;