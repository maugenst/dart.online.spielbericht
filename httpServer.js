var express = require("express");
var hostname = "localhost";
var port = 9000;
var app = express();

process.on('exit', function() {
	console.log("Closing");
	app.close();
});

app.listen(port, hostname);
