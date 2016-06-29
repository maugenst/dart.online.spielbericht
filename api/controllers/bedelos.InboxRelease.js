'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var fs = require('fs');
var jsonfile = require('jsonfile');
jsonfile.spaces = 4;
var walker = require('walker');
var ligaHelper = require('../helpers/Liga');
var tabelle = require('../helpers/Tabelle');
var statistics = require('../helpers/Statistik');
var logger = require('../helpers/Logger');

function inboxRelease (req, res) {
    try {
        var username;
        if (req.headers && req.headers.authorization) {
            username = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString("ascii").split(':')[0];
            if (username !== config.get("bedelos.adminuser")) {
                throw new Error("User not authenticated.");
            }
        }
        var sPath = path.resolve(config.get("bedelos.datapath"));
        var sStatisticsPath = path.resolve(config.get("bedelos.datapath") + '/statistiken/');
        var sTablesPath = path.resolve(config.get("bedelos.datapath") + '/tabellen/');
        var oTeams = require(sPath + '/Teams.json');

        var sGameId = req.swagger.params.gameId.originalValue;

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
