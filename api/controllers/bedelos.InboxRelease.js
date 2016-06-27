'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var nodemailer = require("nodemailer");
var jsonfile = require('jsonfile');
jsonfile.spaces = 4;
var walker = require('walker');
var _ = require('lodash');
var ligaHelper = require('../helpers/Liga');
var tabelle = require('../helpers/Tabelle');
var statistics = require('../helpers/Statistik');

function inboxRelease (req, res) {
    try {
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
    }
}

module.exports = {
    get: inboxRelease
};
