var config = require ('./config.json');
var log = require ('./log');
var morgan = require ('morgan');
var express = require ('express');
var routes = require ('./routes')


process.on('uncaughtException', function (err) {
	console.log ('Except', err.stack);
});

/* Server */
var app = express ();
app.use (morgan ('route', { skip: function (req, res) { return (req.method == 'OPTIONS'); } }));
app.use('/', routes.router);
log.debug ('Server', 'Listening on port: ' + config.port);
var server = app.listen (config.port);
