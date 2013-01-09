// Basic libs
var ua_parser = require('ua-parser');

// 1x1 pixel
var buf = new Buffer(35);
buf.write("R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=", "base64");

// Route
module.exports = {
    path: "/t/",
    type: 'get',
    exec: function(req, res, next) {

        // Debug mode
        res.send(buf, { 'Content-Type': 'image/gif' }, 200);
        return;

        // Get user agent
        req.headers['user-agent'] = req.headers['user-agent'] || 'bot' ;

        //console.log(req.ip) ;
        var params = {
            ua: ua_parser.parse(req.headers['user-agent']).toString(),
            path: req.query.path,
            ip: tools.getClientIp(req),
            source: req.query.source,
            ajax: req.query.isAjax ? 1 : 0
        }

        var sql = "INSERT INTO tracking SET ?";
        tools.log('['+tools.getClientIp(req)+'] ' + db.queryFormat(sql, params), 'lcyan')
        db.query(sql, params, function(err, success) {
            if ( err ) tools.error(err) ;
            res.send(buf, { 'Content-Type': 'image/gif' }, 200);
        })

    }
};