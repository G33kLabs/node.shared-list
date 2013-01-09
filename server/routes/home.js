// Route
module.exports = {
    path: "/",
    type: 'get',
    exec: function(req, res, next) {

        // Define locals to send to template
        var locals = _.extend({}, getUserLocals(req), {
            name: req.query.name
        }) ;

        // Addons
        locals.site.css_addon = ['/assets/css/home.css'] ;
        locals.site.js_addon = ['/assets/js/home.js'] ;

        // Render template
        res.render("home", locals);

    }
};