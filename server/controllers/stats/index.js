///////////////////////////////////////////////////////////// STATS API /////////////
module.exports = Backbone.Model.extend({

	start: function(callback) {

		var self = this,
			Config = Core.config(),
			settings = self.toJSON();

		// Init stats handler
		tools.error('Init stats handler') ;

		// Say that server is loaded
		if ( _.isFunction(callback) ) callback(null, this) ;

	}
})
