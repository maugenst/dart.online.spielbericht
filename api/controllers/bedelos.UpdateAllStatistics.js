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

function customizer(objValue, srcValue) {
    return srcValue + objValue;
}

function calcLigaFromFilename(file) {
    var sRealFilename = path.basename(file).substring(7);
    if (sRealFilename.startsWith('kls')) {
        return 'klsued';
    } else if (sRealFilename.startsWith('kln')) {
        return 'klnord';
    } else if (sRealFilename.startsWith('bzli')) {
        return 'bzLiga';
    } else if (sRealFilename.startsWith('ol')) {
        return 'oberliga';
    }
}

function updateStatistics(oParameters){
    // Updating statistics...

    var sStatisticsPath = oParameters.pathToStatisticsFiles;
    var liga = oParameters.liga;
    var oCurrentResult = oParameters.currentResults;

    var sStatsFile = path.resolve(sStatisticsPath + '/' + liga + '.json');
    var oStatistik = {};
    oStatistik = jsonfile.readFileSync(sStatsFile);
    for(var player in oCurrentResult.playerStats) {
        if (!oStatistik[player]) {
            oStatistik[player] = oCurrentResult.playerStats[player];
        } else {
            oStatistik[player] = _.mergeWith(oStatistik[player], oCurrentResult.playerStats[player], customizer);
        }
    }
    jsonfile.writeFileSync(sStatsFile, oStatistik);
}

function rescanAllStatistics (req, res) {
    try {
        var sPath = path.resolve(config.get("bedelos.datapath"));
        var sResultsPath = path.resolve(config.get("bedelos.datapath") + '/ergebnisse/');
        var sStatisticsPath = path.resolve(config.get("bedelos.datapath") + '/tabellen/');

        // Reset Tables and Scan all results
        jsonfile.writeFileSync(path.resolve(sStatisticsPath + '/bzLiga.json'), {});
        jsonfile.writeFileSync(path.resolve(sStatisticsPath + '/klnord.json'), {});
        jsonfile.writeFileSync(path.resolve(sStatisticsPath + '/klsued.json'), {});
        jsonfile.writeFileSync(path.resolve(sStatisticsPath + '/oberliga.json'), {});

        walker(sResultsPath).on('file', function(file, stat) {
            if (path.extname(file) === '.json') {
                updateStatistics({
                    currentResults: require(file),
                    liga: calcLigaFromFilename(file),
                    pathToStatisticsFiles: sStatisticsPath
                });
            }
        }).on('end', function() {
            res.redirect('/bedelos/inbox');
        });

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));
    }
}

module.exports = {
    get: rescanAllStatistics
};
