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
    logDirectory = path.resolve(__dirname + "/" + config.get("log.dir"));
    // ensure log directory exists
    if (!fs.existsSync(logDirectory)) {
        mkdirp.sync(logDirectory);
    }

    var tempDirectory = path.resolve(__dirname + "/" + config.get("temp.dir"));
    // ensure temp directory exists
    if (!fs.existsSync(tempDirectory)) {
        mkdirp.sync(tempDirectory);
    }
}

try {

    logAll("BeDeLOS - BDL Online Spielberichtsbogen");
    logAll(util.format("Logdirectory: '%s'", logDirectory));
    logAll(util.format("Logfile: '%s'", logger.logFile));

    app.set('views', 'api/views');
    app.set('view engine', 'jade');
    app.use(cors());
    app.use(morgan('combined', {stream: fs.createWriteStream(logDirectory + '/access.log', {flags: 'a'})}));
    app.use('/', express.static('api/static/spielbericht/app'));
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
