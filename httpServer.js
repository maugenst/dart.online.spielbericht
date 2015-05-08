var express = require("express");
var serveIndex = require('serve-index');
var hostname = "localhost";
var port = 9000;
var app = express();


app.use(express.static(__dirname + "/"))
app.use('/spielbericht', serveIndex(__dirname + '/spielbericht'));

process.on('exit', function() {
	console.log("Closing");
	app.close();
});

app.listen(port, hostname);
