 'use strict';

let uid = require(`${__dirname}/api/helpers/UID`);
let crypt = require(`${__dirname}/api/helpers/Crypt`);
let start = (new Date()).getTime();
let mkdirp = require('mkdirp');
let path = require('path');
let fs = require('fs-extra');
let config = require('config');
let util = require('util');
let moment = require('moment');
let logDirectory = "";
let jsonfile = require('jsonfile');
jsonfile.spaces = 4;

_init();
let SwaggerExpress = require('swagger-express-mw');
let express = require('express');
let app = new express();
let https = require('https');
let http = require('http');
let logger = require(`${__dirname}/api/helpers/Logger`);
let morgan = require('morgan');
let cors = require('cors');
let cookieParser = require('cookie-parser');
module.exports = app; // for testing

let serveIndex = require('serve-index');

function logAll(message) {
    logger.console.info(message);
    logger.log.info(message);
}

function FNCheckConfig() {
    let configFile = path.resolve(this.target + this.file);
    let oConfig = (fs.existsSync(configFile)) ? jsonfile.readFileSync(configFile) : {};
    if (!oConfig.secret) {
        oConfig.secret = uid.generate(true);
        jsonfile.writeFileSync(configFile, oConfig);
    }

    if (!oConfig[config.get("bedelos.adminuser")]) {
        let adminuser = config.get("bedelos.adminuser");
        throw new Error("No password for " + adminuser + " found in data/config/config.json. Call 'node adminSecret.js' to set it.");
    }

    crypt.setSecret(oConfig.secret);
}

function FNCheckUserStore() {
    let userStoreFile = path.resolve(this.target + this.file);
    if (!fs.existsSync(userStoreFile)) {
        jsonfile.writeFileSync(userStoreFile, {});
    }
}

function FNCheckAccessCounterStore() {
    let accessCounterStoreFile = path.resolve(this.target + this.file);
    if (!fs.existsSync(accessCounterStoreFile)) {
        jsonfile.writeFileSync(accessCounterStoreFile, {
            today: {
                accesses: 0,
                date: moment().format("YYYYMMDD")
            },
            yesterday: {
                accesses: 0,
                date: moment().subtract(1, 'days').format("YYYYMMDD")
            },
            total: {
                accesses: 0
            }
        });
    }
}

function _init(){
    var aItemsToResolve = [
        { bFile: false, target: __dirname + "/" + config.get("log.dir") },
        { bFile: false, target: __dirname + "/" + config.get("temp.dir") },
        { bFile: false, target: __dirname + "/../backups" },
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

        { bFile: true, target: __dirname + "/data/saison/" + config.get("bedelos.saison"), file: "/Spielplan.json" },
        { bFile: true, target: __dirname + "/data/saison/" + config.get("bedelos.saison"), file: "/Teams.json" },
        { bFile: true, target: __dirname + "/data/saison/" + config.get("bedelos.saison"), file: "/Vereine.json" },
        { bFile: true, target: __dirname + "/data/saison/" + config.get("bedelos.saison"), file: "/TurnierSpieler.json" },
        { bFile: true, target: __dirname + "/data/saison/" + config.get("bedelos.saison"), file: "/Wertung.json" }
    ];

    let oLigen = config.get("bedelos.ligen");
    let aLigen = Object.keys(oLigen);
    aLigen.forEach(liga => {
        aItemsToResolve.push({ bFile: true, target: `${__dirname}/data/saison/${config.get("bedelos.saison")}`, file: `/statistiken/${liga}.json` });
        aItemsToResolve.push({ bFile: true, target: `${__dirname}/data/saison/${config.get("bedelos.saison")}`, file: `/tabellen/${liga}.json` });
    });

    let defaultPath = path.resolve(`${__dirname}/config/default/saison/xxyy`);
    aItemsToResolve.forEach(resolvableItem => {
        if (resolvableItem.bFile) {
            let sTargetFile = path.resolve(resolvableItem.target + resolvableItem.file);
            if (!fs.existsSync(sTargetFile)) {
                let sSourceFile = path.resolve(defaultPath + resolvableItem.file);
                if (!fs.existsSync(sSourceFile)) {
                    jsonfile.writeFileSync(sTargetFile, {});
                } else {
                    try { fs.copySync(sSourceFile, sTargetFile); } catch (err) {}
                }
            }
        } else {
            let sTargetDir = path.resolve(resolvableItem.target);
            if (!fs.existsSync(sTargetDir)) {
                mkdirp.sync(sTargetDir);
            }
        }
        if (resolvableItem.after && typeof resolvableItem.after === 'function') {
            resolvableItem.after();
        }
    });

    logDirectory = path.resolve(__dirname + "/" + config.get("log.dir"));
}

try {

    logAll("BeDeLOS - BDL Online Spielberichtsbogen");
    logAll(util.format("Logdirectory: '%s'", logDirectory));
    logAll(util.format("Logfile: '%s'", logger.logFile));

    app.set('views', 'api/views');
    app.set('view engine', 'jade');
    app.set('json spaces', 2);
    app.use(cors());
    app.use(cookieParser());
    app.use(morgan('combined', {stream: fs.createWriteStream(logDirectory + '/access.log', {flags: 'a'})}));
    app.use('/bedelos', express.static('api/static/spielbericht/app'));
    app.use('/saison', express.static('data/saison'));
    app.use('/backups', serveIndex('../backups', {'icons': true, view:'details'}));
    app.use('/backups', express.static('../backups'));
    app.use('/bedelos/lib', express.static('node_modules'));

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
            http.createServer(app).listen(httpPort, "localhost");
            logAll(util.format("HTTP server running and listening on port=%d", httpPort));
        }
        // HTTPS service
        if (config.get("server.https")) {
            let httpsPort = config.get("server.https.port");
            let httpsKeyFile = config.get("server.https.keyFile");
            let httpsCertFile = config.get("server.https.certFile");
            https.createServer({
                key: fs.readFileSync(httpsKeyFile),
                cert: fs.readFileSync(httpsCertFile)
            }, app).listen(httpsPort, "localhost");
            logAll(util.format("HTTPS server running and listening on port=%d (key file=%s, certificate file=%s)",
                httpsPort, httpsKeyFile, httpsCertFile));
        }
        let took = (new Date()).getTime() - start;
        logAll(util.format("Startup took %s milliseconds.", took));

    });
} catch (error) {
    logger.log.error("Severe bedelos error happened.", error);
    logger.console.error("Severe bedelos error happened.", error);
}
