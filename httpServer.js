var express = require("express");
var serveIndex = require('serve-index');
var morgan = require('morgan');
var hostname = "localhost";
var port = 9000;
var app = express();


app.use(express.static(__dirname + "/"));
app.use(morgan('combined'));
app.use('/spielbericht', serveIndex(__dirname + '/spielbericht'));

process.on('exit', function() {
	console.log("Closing");
	app.close();
});

app.listen(port, hostname);
app.listen(port, "wdfd00288156a.dhcp.wdf.sap.corp");
