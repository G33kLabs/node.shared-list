(function() {

    //////////////////////////////////////////////// LOAD LIBS
    var parse = require('url').parse,
        fs = require('fs'),
        uuid = require('node-uuid'),
        SignedRequest = require('../libs/facebook-signed-request') ;

    //////////////////////////////////////////////// LOAD ADMINS
    var fb_admins = [] ;

    //////////////////////////////////////////////// VERSION FOR ASSETS
    var asset_version = uuid.v1().replace(/\-/g, '') ;

    //////////////////////////////////////////////// HELPERS
    getUserLocals = function(req) {
        var match, config = _.extend({}, Core.config().www);

        // Load faceboook admins
        if ( ! fb_admins.length ) {
           fb_admins = _.map(_.filter(Core.config().Users, function(user) {
                return ( user.role == 'admin' && user.fb_id ) 
            }), function(user) {
                return user.fb_id
            }); 
        }

        // Inject fb admins into locals
        if ( fb_admins.length ) config.facebook.admins = fb_admins.join(',');

        ////////////////////////////////////////////////////////////////// DEBUG
        if ( process.env.DEV ) {
            //req.session.fb_user = req.session.fb_user || {} ;
            //req.session.fb_user.country = 'fr' ;
            //req.session.fb_user.locale = 'fr_FR' ;

            //req.session.fb_page = req.session.fb_page || {} ;
            //req.session.fb_page.liked = false;
            //req.session.fb_page.id = _.last(config.facebook.pages).id;
            //req.session.fb_page.id = "203026316407329"; 
        }

        ////////////////////////////////////////////////////////////////// FACEBOOK SESSION
        if ( req.session.fb_page ) {

            // Search corresponding fanpage
            var fanpage = _.find(config.facebook.pages, function(page) {
                return page.id == req.session.fb_page.id
            })
            if ( ! fanpage ) fanpage = _.first(config.facebook.pages)

            // Set page id & url
            if ( fanpage ) {
                config.facebook.page_id = fanpage.id;
                config.facebook.page_url = fanpage.url;
                config.facebook.tab_url = fanpage.tab_url;
                config.facebook.app_url = fanpage.app_url;
                config.facebook.go_url = fanpage.go_url;
            }

            // Set if user like or not the application
            config.facebook.liked = req.session.fb_page.liked ;

        }

        ////////////////////////////////////////////////////////////////// CHECK ADMIN
        if ( req.session.fb_user ) {
            config.isAdmin = _.find(Core.config().Users, function(user) {
                return (user.role=='admin') && (user.fb_id == req.session.fb_user.id)
            }); 
        }     
        if ( req.session.fb_admin ) {
            config.isAdmin = true;
        } 

        ////////////////////////////////////////////////////////////////// ADD LANG INTO CONFIG
        config = _.extend({ lang: Core.config().lang }, config)

        ////////////////////////////////////////////////////////////////// LANG

        // Get user lang from fb datas else get from node 'locale' module
        var default_lang = config.lang.supported[0];
        var user_lang =  (((req.session.fb_user && req.session.fb_user.locale) ? req.session.fb_user.locale : req.locale));

        // Debug use : received lang from get query
        if ( req.query.lang ) user_lang = req.query.lang; 

        // Debug
        //console.log('Lang >> '+user_lang)

        // Check that language exists else set to default
        user_lang = config.lang[user_lang] ? user_lang : default_lang;

        // Set lang for page
        config.user_lang = user_lang;

        // If default language is same as user : send keys
        config.lang = config.lang[user_lang] ;

        ////////////////////////////////////////////////////////////////// COUNTRY
        config.user_country = (((req.session.fb_user && req.session.fb_user.country) ? req.session.fb_user.country : ''));

        //console.log("User language :: "+user_lang, req.session.fb_user ) ;  

        ////////////////////////////////////////////////////////////////// TEMPLATE
        // Get dynamic website url (http or https detection)
        config.site.website = req.protocol + '://' + req.headers.host;
        config.site.canonical = config.site.website + req.url;
        config.site.path = encodeURIComponent(req.url);

        // Replace all website urls
        _.each(config.site, function(val, key) {
            if ( _.isString(val) ) {
                config.site[key] = val.replace(/^\[\[website\]\]/, config.site.website) ;
            }
        }) 

        // Set defaults
        config.site = _.extend({
           dev: process.env.DEV ? true : false,
           version: asset_version,
           official_version: config.official.version,
           js_addon: [],
           css_addon: []
        }, config.site) ;

        // LOgs
        //console.log(config)

        // Debug
        var log_datas = { path: req.path }; 
        _.each(req.session, function(v, k) {
            if (k!='cookie') log_datas[k] = v;
        }) ;

        if ( ! config.isAdmin ) {
            tools.log('['+tools.getClientIp(req)+ '] | '+JSON.stringify(log_datas), 'yellow') ;
        }

        else {
            try {
                tools.log('['+tools.getClientIp(req)+ '] | '+req.path+' | '+"Admin :: "+req.session.fb_admin.me.email, 'brown') ;
            } catch(e) {} ;
        }

        // return customized config
        return _.extend({}, config);
    }

    // Parse signed request
    parseSigned = function(signed_request, callback) {
        var config = _.extend({}, Core.config().www);
        SignedRequest.secret = config.facebook.app_secret;
        var signedRequest = new SignedRequest(signed_request);
        signedRequest.parse(function(err, res) {
           // console.log("parseSigned::", err, res)
            callback(err&&err.length?err.join("\n"):false, res); 
        });
    }

    // Redirect via javascript
    redirectUrl = function(url) {
        return "<script type='text/javascript'>window.top.location.href='"+url+"'</script>"
    }

    //////////////////////////////////////////////// HOME
    exports.home = require('./home.js') ;

    //////////////////////////////////////////////// TRACKING
    exports.tracking = require('./tracking.js') ;

}).call(this);