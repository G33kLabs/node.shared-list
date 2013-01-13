{
	"Users": [
        {
            "role": 'admin',
            "name": 'Guillaume DE LA RUE',
            "social": {
                'Twitter': {
                    id: '244561106',
                    pseudo: '@G33kLabs',
                    profile: 'https://twitter.com/G33kLabs'
                },
                'Facebook': {
                    id: '582526084',
                    pseudo: '@Guiltouf',
                    profile: 'https://www.facebook.com/guiltouf'
                },
                'Github': {
                    pseudo: '@G33kLabs',
                    profile: 'https://github.com/G33kLabs'
                },
                'Google': {
                    id: '115555146160120072472',
                    pseudo: '@G33k',
                    profile: 'https://plus.google.com/115555146160120072472/'
                }
            }
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
            'assets/vendors/bootstrap/bootstrap-responsive.css',
            'assets/css/app.css'
        ],
        "js": [
            'assets/vendors/jquery.min.js',
            'assets/vendors/underscore.min.js',
            'assets/vendors/async.min.js',
            'assets/vendors/json3.min.js',
            'assets/vendors/moment.min.js',
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
            "title": "Easy list sharing",
            "title_sufix": " | G33KLabs",
            "desc": "The easiest way to share list anonymously with your friends !",
            "type": "website",
            "keywords": "share tools, share list, connect friends",
            "image": "[[website]]/assets/img/logo_share.jpg",
            "copyright": "© Copyright 2013 | G33kLabs"
        },
        "official": {
            "website_url": "http://shared-list.herokuapp.com/",
            "website": "shared-list.herokuapp.com",
            "version": "1.1.0"
        },
        "analytics": {
            "google": process.env.GOOGLE_ANALYTICS,
            //"local_pixel": "/t/"
        },
        "facebook": {
            "app_id": process.env.FACEBOOK_APP_ID,
            "app_secret": process.env.FACEBOOK_SECRET,
            "perms": process.env.FACEBOOK_PERMS
        }
    },
    "lang": {
        "supported": ['en_US', 'fr_FR']
    }
}