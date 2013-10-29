/**
 * Module dependencies.
 */

var config = require('config');
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var shift = require('./routes/shift');
var http = require('http');
var path = require('path');
var app = express();

// all environments
app.set('port', config.port || process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.limit(config.maxFileSize || '100kb'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.post('/shift', shift.processRequest);

http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});
