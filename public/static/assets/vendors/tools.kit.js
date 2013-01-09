(function(global) {

	// -- Init tools
	global.tools = (typeof tools == 'undefined') ? {} : tools;

	// -- Check email
	tools.validateEmail = function(email){
	    return /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(email);
	}

	// -- Detect if upload is supported
	tools.isInputTypeFileImplemented = function() {
	    var elem = document.createElement("input");
	    elem.type = "file";
	    if (elem.disabled) return false;
	    try {
	        elem.value = "Test"; // Throws error if type=file is implemented
	        return elem.value != "Test";
	    } catch(e) {
	        return elem.type == "file";
	    }
	}

	// -- Detect mobile devices
	tools.isMobile = {
	    Android: function() {
	        return navigator.userAgent.match(/Android/i);
	    },
	    BlackBerry: function() {
	        return navigator.userAgent.match(/BlackBerry/i);
	    },
	    iOS: function() {
	        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	    },
	    Opera: function() {
	        return navigator.userAgent.match(/Opera Mini/i);
	    },
	    Windows: function() {
	        return navigator.userAgent.match(/IEMobile/i);
	    },
	    any: function() {
	        return (tools.isMobile.Android() || tools.isMobile.BlackBerry() || tools.isMobile.iOS() || tools.isMobile.Opera() || tools.isMobile.Windows());
	    }
	};

	// -- Find and parse a template for Mustache
	tools.tpl = function(id) {
		return $('script#'+id).html().replace(/\{/g, '{{').replace(/\}/g, '}}');
	};

	// -- Reduce a string
	tools.reduce_string = function(str, max, ratio) {
	    str = (str || '')+'' ;
	    max = max || 25;
	    ratio = ratio || 0.5; 

	    if ( str.length > max ) {
	        var start_cut = Math.floor(max*ratio);
	        var end_cut = Math.floor(max*(1-ratio));
	        str = str.slice(0, start_cut)+'...'+str.slice(-1*end_cut); 
	    }

	    return str;
	}


})( window );