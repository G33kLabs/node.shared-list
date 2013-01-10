(function () {

    // -> DOM
    var elems = {
        editor : $('#pad_editor'),
        editor_loading: $('#tpl_textarea_default').html(),
        status: $('#status')
    }

    // -> Overload app
    var connection = null; 
    var activeDoc = null;
    var openShareList = function(title) { 

        // -> Set this doc as active
        activeDoc = title; 

        // -> Connection status display
        var status = elems.status.show(0);

        // -> Open a shred list
        var textarea = $('<textarea id="pad" disabled>'+elems.editor_loading+'</textarea>'); 
        elems.editor.css({display: 'block'}) ;
        $('#editor h4').html('Share link : <a href="'+window.location.href+'">'+window.location.href+'</a>')
        $('#pad_container').html(textarea) ;

        // -> Open connexion
        connection = sharejs.open(activeDoc, 'text', function(error, doc) {
            if (error) {
                console.log(error);
            } else {
                textarea.get(0).disabled = false;
                doc.attach_textarea(textarea.get(0));
            }
            updateShareList() ;
        });  

        // -> Bind events to status
        var register = function(state, klass, text) {
            connection.on(state, function() {
                elems.status.attr('class', 'label label-' + klass);
                elems.status.html(text);
                console.log(state, connection)
            });
        };
        register('ok', 'success', 'Online');
        register('connecting', 'warning', 'Connecting...');
        register('disconnected', 'important', 'Offline');
        register('stopped', 'important', 'Error'); 

    }

    // -> Update documents list
    var updateShareList = function() {

        // -> Build document list
        var docs = [] ;
        var localDatas = window.localStorage['lists'] ;
        if ( localDatas && (localDatas=JSON.parse(localDatas)) ) {
            _.each(localDatas, function(data) {
                docs.push(data) ;
            })
        }

        // -> Refresh documents list
        if ( connection && connection.docs ) {
            _.each(connection.docs, function(doc) {
                var exists = _.find(docs, function(data) {
                    return data.name == doc.name;
                })
                if ( ! exists ) {
                    docs.push({
                        name: doc.name,
                        version: doc.version,
                        modified: $.now()
                    })
                }
                else {
                    exists.version = doc.version;
                    if ( activeDoc && (exists.name == activeDoc) ) {
                        exists.modified = $.now();
                    }
                }
                //console.log('found in history :: ',exists)
            })
        }

        // -> Sort document list
        if ( docs && docs.length ) {
            docs = _.sortBy(docs, function(doc){ return doc.modified });
            docs = docs.reverse(); 
        }

        // -> Update html dropdown list
        var html = '<li><a href="#new">Create new</a></li><li class="divider"></li>'; 
        _.each(docs, function(doc) { 
            html += '<li><a href="#'+doc.name+'" id="'+doc.name+'"><b>'+doc.name+'</b> <em>('+moment(doc.modified).format('YYYY-MM-DD HH:mm:ss')+')</em></a></li>';
        });
        $('#documents_list').html(html);

        // -> Update docs name into localStorage for future visits
        var storeDatas = _.map(docs, function(doc) {
            return {
                name: doc.name,
                version: doc.version,
                modified: doc.modified||$.now()
            }
        }) ;

        // -> Write datas to localStorage
        try { window.localStorage['lists'] = JSON.stringify(storeDatas) } 
        catch(e) { console.log(e) ; }

    }

    // -> Generate id
    var generateId = function(len) {
        var text = "";
        var count = len || 5; 
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < count; i++ ) text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

    $(document).ready(function () {

        // -> Load application UI
        console.log('[>] Home JS is ready !') ;

        // -> Load ShareJS
        async.series([
        	function(callback) {
        		require(['/assets/vendors/ace.js'], function() {
        			callback(null);
        		})
        	},
        	function(callback) {
        		require(['/channel/bcsocket.js'], function() {
        			callback(null);
        		})
        	},
        	function(callback) {
        		require(['/share/share.js'], function() {
        			callback(null);
        		})
        	},
        	function(callback) {
        		require(['/share/textarea.js'], function() {
        			callback(null);
        		})
        	},
        	function(callback) {
        		require(['/share/ace.js'], function() {
        			callback(null);
        		})
        	}
        ], 

        // -> Init display
        function(err, res) {
        	$(window).trigger('hashchange') ;
        	updateShareList() ;
        })
	
    });

    // -> Manage document toggle
    var manageDocDisplay = function() {
        var hash = window.location.hash.slice(1); //hash to string (= "myanchor")
        console.log("manageDocDisplay::", hash) ;
        if ( hash && hash != 'home' ) {
            if ( hash == 'new' ) {
                hash = generateId(24) ;
                window.location.hash = hash;
                return;
            }
            openShareList(hash) ;   
            //console.log($('#editor').offset().top) ;`
            elems.editor.css({display: 'block'}) ;
            $('body').stop().animate({'scrollTop': elems.editor.offset().top}, 800) ;
        }
        else {
            $('body').stop().animate({scrollTop: 0}, 800, function() {
                elems.editor.css({display: 'none'}) ; 
            });
        }
    }

	// -> Bind hash changes
	$(window).on('hashchange', function () { //detect hash change
	    manageDocDisplay() 
	});

	// -> Disable effects on hash links
	$('a[href*=#]').live('click', function(e) {
		var hash = this.getAttribute('href') ;

        // If document is already opened
        //console.log("->" + window.location.hash + ' => ' + hash)
        window.location.hash = hash;

        // Prevent click
		e.preventDefault() ;
	})


}).apply(this);