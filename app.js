'use strict';

var uid = require(__dirname + "/api/helpers/UID");
var crypt = require(__dirname + "/api/helpers/Crypt");
var start = (new Date()).getTime();
var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs-extra');
var config = require('config');
var util = require('util');
var logDirectory = "";
var jsonfile = require('jsonfile');
jsonfile.spaces = 4;

_init();
var SwaggerExpress = require('swagger-express-mw');
var express = require('express');
var app = new express();
var https = require('https');
var http = require('http');
var logger = require(__dirname + "/api/helpers/Logger");
var morgan = require('morgan');
var cors = require('cors');
var cookieParser = require('cookie-parser');
module.exports = app; // for testing



function logAll(message) {
    logger.console.info(message);
    logger.log.info(message);
}

function FNCheckConfig() {
    var configFile = path.resolve(this.target + this.file);
    var oConfig = (fs.existsSync(configFile)) ? jsonfile.readFileSync(configFile) : {};
    if (!oConfig.secret) {
        oConfig.secret = uid.generate(true);
        jsonfile.writeFileSync(configFile, oConfig);
    }

    if (!oConfig[config.get("bedelos.adminuser")]) {
        var adminuser = config.get("bedelos.adminuser");
        throw new Error("No password for " + adminuser + " found in data/config/config.json. Call 'node adminSecret.js' to set it.");
    }

    crypt.setSecret(oConfig.secret);
}

function FNCheckUserStore() {
    var userStoreFile = path.resolve(this.target + this.file);
    if (!fs.existsSync(userStoreFile)) {
        jsonfile.writeFileSync(userStoreFile, {});
    }
}

function FNCheckAccessCounterStore() {
    var accessCounterStoreFile = path.resolve(this.target + this.file);
    if (!fs.existsSync(accessCounterStoreFile)) {
        jsonfile.writeFileSync(accessCounterStoreFile, {
            counter: 0
        });
    }
}

function _init(){
    var aItemsToResolve = [
        { bFile: false, target: __dirname + "/" + config.get("log.dir") },
        { bFile: false, target: __dirname + "/" + config.get("temp.dir") },
        { bFile: false, target: __dirname + "/data" },

        { bFile: false, target: __dirname + "/data/config/" },
        { bFile: true,  target: __dirname + "/data/config", file: "/config.json", after: FNCheckConfig },
        { bFile: true,  target: __dirname + "/data/config", file: "/userStore.json", after: FNCheckUserStore },
        { bFile: true,  target: __dirname + "/data/config", file: "/counter.json", after: FNCheckAccessCounterStore },

        { bFile: false, target: __dirname + "/data/saison/" },
        { bFile: false, target: __dirname + "/data/saison/" + config.get("bedelos.saison") },
        { bFile: false, target: __dirname + "/data/saison/" + config.get("bedelos.saison") + "/ergebnisse" },
        { bFile: false, target: __dirname + "/data/saison/" + config.get("bedelos.saison") + "/statistiken" },
        { bFile: false, target: __dirname + "/data/saison/" + config.get("bedelos.saison") + "/tabellen" },
        { bFile: false, target: __dirname + "/data/saison/" + config.get("bedelos.saison") + "/pictures" },
        { bFile: false, target: __dirname + "/data/saison/" + config.get("bedelos.saison") + "/inbox" },

        { bFile: true, target: __dirname + "/data/saison/" + config.get("bedelos.saison"), file: "/statistiken/klnord.json" },
        { bFile: true, target: __dirname + "/data/saison/" + config.get("bedelos.saison"), file: "/statistiken/klsued.json" },
        { bFile: true, target: __dirname + "/data/saison/" + config.get("bedelos.saison"), file: "/statistiken/bzLiga.json" },
        { bFile: true, target: __dirname + "/data/saison/" + config.get("bedelos.saison"), file: "/statistiken/oberliga.json" },
        { bFile: true, target: __dirname + "/data/saison/" + config.get("bedelos.saison"), file: "/tabellen/klnord.json" },
        { bFile: true, target: __dirname + "/data/saison/" + config.get("bedelos.saison"), file: "/tabellen/klsued.json" },
        { bFile: true, target: __dirname + "/data/saison/" + config.get("bedelos.saison"), file: "/tabellen/bzLiga.json" },
        { bFile: true, target: __dirname + "/data/saison/" + config.get("bedelos.saison"), file: "/tabellen/oberliga.json" },
        { bFile: true, target: __dirname + "/data/saison/" + config.get("bedelos.saison"), file: "/Spielplan.json" },
        { bFile: true, target: __dirname + "/data/saison/" + config.get("bedelos.saison"), file: "/Teams.json" },
        { bFile: true, target: __dirname + "/data/saison/" + config.get("bedelos.saison"), file: "/Wertung.json" }
    ];

    var defaultPath = path.resolve(__dirname + "/config/default/saison/xxyy");

    for(var i = 0; i<aItemsToResolve.length; i++) {
        if (aItemsToResolve[i].bFile) {
            var sTargetFile = path.resolve(aItemsToResolve[i].target + aItemsToResolve[i].file);
            if (!fs.existsSync(sTargetFile)) {
                var sSourceFile = path.resolve(defaultPath + aItemsToResolve[i].file);
                try { fs.copySync(sSourceFile, sTargetFile); } catch (err) {}
            }
        } else {
            var sTargetDir = path.resolve(aItemsToResolve[i].target);
            if (!fs.existsSync(sTargetDir)) {
                mkdirp.sync(sTargetDir);
            }
        }
        if (aItemsToResolve[i].after && typeof aItemsToResolve[i].after === 'function') {
            aItemsToResolve[i].after();
        }
    }

    logDirectory = path.resolve(aItemsToResolve[0].target);
}

try {

    logAll("BeDeLOS - BDL Online Spielberichtsbogen");
    logAll(util.format("Logdirectory: '%s'", logDirectory));
    logAll(util.format("Logfile: '%s'", logger.logFile));

    app.set('views', 'api/views');
    app.set('view engine', 'jade');
    app.use(cors());
    app.use(cookieParser());
    app.use(morgan('combined', {stream: fs.createWriteStream(logDirectory + '/access.log', {flags: 'a'})}));
    app.use('/bedelos', express.static('api/static/spielbericht/app'));
    app.use('/saison', express.static('data/saison'));

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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
