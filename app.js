'use strict';

var start = (new Date()).getTime();
var logDirectory = "";
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var config = require('config');

_init();

var bbPromise = require('bluebird');
var util = require('util');
var SwaggerExpress = require('swagger-express-mw');
var middleware = require('swagger-express-middleware');
var cors = require('cors');
var express = require('express');
var app = new express();
var https = require('https');
var http = require('http');
var logger = require(__dirname + "/app/helpers/Logger");
var morgan = require('morgan');

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

function validateConfiguration(){
    var environment = config.get("server.environment");
    logAll(util.format("Using configuration environment: '%s'", environment));
}

try {
    validateConfiguration();

    logAll(util.format("Logfile: '%s'", logger.logFile));

    app.use(cors());
    app.use(morgan('combined', {stream: fs.createWriteStream(logDirectory + '/access.log', {flags: 'a'})}));
    app.use('/', express.static('app/static/spielbericht/app'));

    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

    /*SwaggerExpress.create({
        appRoot: __dirname,
        swaggerFile: "app/swagger/swagger.yaml"
    }, function (err, swaggerExpress) {
        if (err) {
            throw err;
        }

        // HTTP service
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
    });*/


    middleware(path.join(__dirname, 'app/swagger/swagger.yaml'), app, function(err, middleware) {
        
        app.use(
            middleware.metadata(),
            middleware.CORS(),
            middleware.files(),
            middleware.parseRequest(),
            middleware.validateRequest(),
            middleware.mock()
        );

        // HTTP service
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

    app.use(function(err, req, res, next) {
        console.log("Unhandled error detected: " + err.message);
        res.json(new CsmError(err.message)).status(500);
    });

} catch (error) {
    logger.log.error("Severe bedelos error happened.", error);
    logger.console.error("Severe bedelos error happened.", error);
}
