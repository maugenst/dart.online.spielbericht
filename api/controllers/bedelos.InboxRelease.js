'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var fs = require('fs');
var pug = require('pug');
var jsonfile = require('jsonfile');
jsonfile.spaces = 4;
var walker = require('walker');
var ligaHelper = require('../helpers/Liga');
var tabelle = require('../helpers/Tabelle');
var statistics = require('../helpers/Statistik');
var logger = require('../helpers/Logger');
var session = require('../helpers/Session');

function inboxRelease (req, res) {
    try {
        var oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);

        if (!oSessionData) {
            res.cookie('BDL_SESSION_REDIRECT', req.url);
            res.redirect("/bedelos/login");
            return;
        }

        if (oSessionData.username !== config.get("bedelos.adminuser")) {
            res.status(200).send(pug.renderFile("api/views/authorizederror.jade"));
            return;
        }

        var sPath = path.resolve(config.get("bedelos.datapath"));
        var sStatisticsPath = path.resolve(config.get("bedelos.datapath") + '/statistiken/');
        var sTablesPath = path.resolve(config.get("bedelos.datapath") + '/tabellen/');
        var oTeams = require(sPath + '/Teams.json');

        var sGameId = req.swagger.params.gameId.raw;

        walker(sPath + '/inbox').on('file', function(file, stat) {
            if (path.basename(file).indexOf(sGameId) === 0) {
                var oCurrentResult = require(file);
                var liga = ligaHelper.calcLigaFromFilename(file);

                statistics.update({
                    currentResults: oCurrentResult,
                    liga: liga,
                    pathToStatisticsFiles: sStatisticsPath
                });
                tabelle.update({
                    currentResults: oCurrentResult,
                    liga: liga,
                    pathToTablesFiles: sTablesPath
                });

                // So if everything is fine ... rename / move the file to results folder
                var newName = path.resolve(sPath + '/ergebnisse/' + path.basename(file).substring(7));
                fs.renameSync(file, newName);
            }
        }).on('end', function() {
            res.redirect('/bedelos/inbox');
        });

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: inboxRelease
};
