#!/usr/local/bin/node
/*
### BEGIN INIT INFO
# Provides: Node.X10
# Required-Start: $local_fs $network $syslog
# Required-Stop: $local_fs $network $syslog
# Default-Start: 2 3 4 5
# Default-Stop: 0 1 6
# Short-Description: Start daemon at boot time
# Description: Enable service provided by Node.X10
### END INIT INFO
*/

///////////////////////////////////////////////////////////// INSTALLATION /////////////
// sudo npm install -g simple-daemon
// sudo chmod +x /var/www/Node.x10/server/helpers/bootscript.js
// sudo ln -s /var/www/Node.x10/server/helpers/bootscript.js /etc/init.d/Node.x10
// sudo update-rc.d Node.x10 defaults

///////////////////////////////////////////////////////////// LOAD LIBS /////////////
var daemon = require('/usr/local/lib/node_modules/simple-daemon'); 
var fs = require('fs') ;

///////////////////////////////////////////////////////////// CONFIG LAUNCHER /////////////
var appName = "Node.x10"; 
var appPath = "/var/www/Node.x10" ;
var appScript = appPath+'/app.js'; 
var appLog = appPath+'/logs/app.log'; 
var appPID = appPath+'/'+appName+'.pid' ;
var user = 'pi' ;

///////////////////////////////////////////////////////////// ON STOP /////////////
daemon.stopped = function(killed) {
	if ( killed ) {
		fs.appendFile(appLog, "\033[35m[+] Daemon stop server...\033[39m\n", function (err) {
			console.log(appName+' Stopped.')
		});
	}
	else {
		console.log(appName+' Not running.')
	}
}

///////////////////////////////////////////////////////////// START DAEMON /////////////
daemon.simple({
    pidfile : appPID,
    logfile : appLog,
    command : process.argv[3],
    runSync     : function () {
        require (appScript);
        process.setuid(user);
    }
});