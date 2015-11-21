var config = require('config');
var express = require('express');
var upload = require('multer')();
var app = express();

// expose static files
app.use(express.static(__dirname + '/public'));

// form middleware
app.post('/shift', upload.single('input'), require('./app/shifter'));

app.listen(config.port, function () {
	console.log('Express server listening on port %s', config.port);
});
