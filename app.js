'use strict';

var start = (new Date()).getTime();
var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');
var config = require('config');
var util = require('util');
var logDirectory = "";
_init();

var SwaggerExpress = require('swagger-express-mw');
var express = require('express');
var app = new express();
var https = require('https');
var http = require('http');
var logger = require(__dirname + "/api/helpers/Logger");
var morgan = require('morgan');
var cors = require('cors');
module.exports = app; // for testing


function logAll(message) {
    logger.console.info(message);
    logger.log.info(message);
}

function _init(){
    var aPathsToResolve = [
        path.resolve(__dirname + "/" + config.get("log.dir")),
        path.resolve(__dirname + "/" + config.get("temp.dir")),
        path.resolve(__dirname + "/data"),
        path.resolve(__dirname + "/data/saison"),
        path.resolve(__dirname + "/data/saison/" + config.get("bedelos.saison")),
        path.resolve(__dirname + "/data/saison/" + config.get("bedelos.saison") + "/ergebnisse"),
        path.resolve(__dirname + "/data/saison/" + config.get("bedelos.saison") + "/pictures"),
        path.resolve(__dirname + "/data/saison/" + config.get("bedelos.saison") + "/inbox")
    ];

    for(var i = 0; i<aPathsToResolve.length; i++) {
        // ensure that this directory exists
        if (!fs.existsSync(aPathsToResolve[i])) {
            mkdirp.sync(aPathsToResolve[i]);
        }
    }
    logDirectory = aPathsToResolve[0];
}

try {

    logAll("BeDeLOS - BDL Online Spielberichtsbogen");
    logAll(util.format("Logdirectory: '%s'", logDirectory));
    logAll(util.format("Logfile: '%s'", logger.logFile));

    app.set('views', 'api/views');
    app.set('view engine', 'jade');
    app.use(cors());
    app.use(morgan('combined', {stream: fs.createWriteStream(logDirectory + '/access.log', {flags: 'a'})}));
    app.use('/bedelos', express.static('api/static/spielbericht/app'));
    app.use('/saison', express.static('data/saison'));

    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

    SwaggerExpress.create({
        appRoot: __dirname,
        swaggerFile: "api/swagger/swagger.yaml"
    }, function (err, swaggerExpress) {
        if (err) {
            throw err;
        }

        // install middleware
        swaggerExpress.register(app);

        if (config.get("server.http")) {
            var httpPort = config.get("server.http.port");
            http.createServer(app).listen(httpPort);
            logAll(util.format("HTTP server running and listening on port=%d", httpPort));
        }
        // HTTPS service
        if (config.get("server.https")) {
            var httpsPort = config.get("server.https.port");
            var httpsKeyFile = config.get("server.https.keyFile");
            var httpsCertFile = config.get("server.https.certFile");
            https.createServer({
                key: fs.readFileSync(httpsKeyFile),
                cert: fs.readFileSync(httpsCertFile)
            }, app).listen(httpsPort);
            logAll(util.format("HTTPS server running and listening on port=%d (key file=%s, certificate file=%s)",
                httpsPort, httpsKeyFile, httpsCertFile));
        }
        var took = (new Date()).getTime() - start;
        logAll(util.format("Startup took %s milliseconds.", took));

    });
} catch (error) {
    logger.log.error("Severe bedelos error happened.", error);
    logger.console.error("Severe bedelos error happened.", error);
}
