{
	"Users": [
        {
            "fb_id": '582526084', 
            "role": 'admin',
            "name": 'Guillaume DE LA RUE'
        }
    ],
	"Server": {
		"host": '127.0.0.1',
		"port": process.env.PORT || 5000
	},
    "Session": {
        "cookname": 'express.sid',
        "secret": process.env.SESSION_SECRET || 'N0d3*)s3Ss10n',
        "cookoptions": {
            "domain": process.env.COOKIE_DOMAIN,
            "path": '/', 
            "maxAge": 24*3600*1000
        }
    },
    "Static": {
        "live": true,
        "css": [
            'assets/vendors/bootstrap/bootstrap.css',
            'assets/css/app.css'
        ],
        "js": [
            'assets/vendors/jquery.min.js',
            'assets/vendors/underscore.min.js',
            'assets/vendors/async.min.js',
            'assets/vendors/json3.min.js',
            'assets/vendors/browser.detect.js',
            'assets/vendors/backbone.min.js',
            'assets/vendors/mustache.min.js',
            'assets/vendors/jquery.fb.js',
            'assets/vendors/tools.kit.js',
            'assets/vendors/jquery.gatracker.js',
            'assets/vendors/bootstrap/bootstrap.min.js',
            'assets/vendors/jquery.activity-indicator-1.0.0.min.js',
            'assets/js/app.js'
        ]
    },
    "www": {
        "site": {
            "title": "MAJED by Alexa Chung",
            "title_sufix": " | PRESSURE",
            "desc": "MAJE vous propose de partir à NY pour un shooting exceptionnel avec Alexa Chung !",
            "language": 'fr-FR',
            "type": "website",
            "keywords": "Alexa Chung, Mode, Maje, Majed, facebook, jeu concours, séjour, new york",
            "image": "[[website]]/assets/img/logo_maje_share.jpg"
        },
        "official": {
            "website_url": "http://www.maje.com/",
            "website": "www.maje.com"
        },
        "analytics": {
            "google": process.env.GOOGLE_ANALYTICS
        },
        "facebook": {
            "app_id": process.env.FACEBOOK_APP_ID,
            "app_secret": process.env.FACEBOOK_SECRET,
            "perms": process.env.FACEBOOK_PERMS,
            "pages": [
                {
                    "id": "52249877756",
                    "url": "http://www.facebook.com/maje.officiel",
                    "name": "maje.fr",
                    "tab_url": "http://www.facebook.com/maje.officiel/app_135748023244067",
                    "go_url": "https://majed-by-alexa.herokuapp.com/go/"
                }
            ]
        }
    },
    "lang": {
        "supported": ['fr_FR', 'en_US']
    }
}