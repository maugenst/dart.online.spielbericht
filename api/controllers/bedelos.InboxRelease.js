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

function updateTable(oParameters){
    // Updating table...
    var sTablesPath = oParameters.pathToTablesFiles;

    var liga = oParameters.liga;
    var oCurrentResult = oParameters.currentResults;

    var sTableFile = path.resolve(sTablesPath + '/' + liga + '.json');
    var oTabelle = {};
    oTabelle = jsonfile.readFileSync(sTableFile);

    if(!oTabelle[oCurrentResult.heim]) {
        oTabelle[oCurrentResult.heim] = {
            'spiele': 0, 'gewonnen': 0, 'unentschieden': 0, 'verloren': 0,
            'sets': { 'own': 0, 'other': 0 },
            'punkte': { 'own': 0, 'other': 0 }
        };
    }
    if(!oTabelle[oCurrentResult.gast]) {
        oTabelle[oCurrentResult.gast] = {
            'spiele': 0, 'gewonnen': 0, 'unentschieden': 0, 'verloren': 0,
            'sets': { 'own': 0, 'other': 0 },
            'punkte': { 'own': 0, 'other': 0 }
        };
    }

    oTabelle[oCurrentResult.heim].spiele++;
    oTabelle[oCurrentResult.gast].spiele++;

    if (oCurrentResult.summary.heim.sets > oCurrentResult.summary.gast.sets) {
        oTabelle[oCurrentResult.heim].gewonnen++;
        oTabelle[oCurrentResult.gast].verloren++;
        oTabelle[oCurrentResult.heim].punkte.own += 2;
        oTabelle[oCurrentResult.gast].punkte.other += 2;
    } else if (oCurrentResult.summary.heim.sets = oCurrentResult.summary.gast.sets) {
        oTabelle[oCurrentResult.heim].unentschieden++;
        oTabelle[oCurrentResult.gast].unentschieden++;
        oTabelle[oCurrentResult.heim].punkte.own++;
        oTabelle[oCurrentResult.heim].punkte.other++;
        oTabelle[oCurrentResult.gast].punkte.own++;
        oTabelle[oCurrentResult.gast].punkte.other++;
    } else if (oCurrentResult.summary.heim.sets < oCurrentResult.summary.gast.sets) {
        oTabelle[oCurrentResult.heim].verloren++;
        oTabelle[oCurrentResult.gast].gewonnen++;
        oTabelle[oCurrentResult.heim].punkte.other += 2;
        oTabelle[oCurrentResult.gast].punkte.own += 2;
    }
    oTabelle[oCurrentResult.heim].sets.own += oCurrentResult.summary.heim.sets;
    oTabelle[oCurrentResult.heim].sets.other += oCurrentResult.summary.gast.sets;
    oTabelle[oCurrentResult.gast].sets.own += oCurrentResult.summary.gast.sets;

    oTabelle[oCurrentResult.gast].sets.other += oCurrentResult.summary.heim.sets;
    jsonfile.writeFileSync(sTableFile, oTabelle);
}

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
                var liga = calcLigaFromFilename(file);

                updateStatistics({
                    currentResults: oCurrentResult,
                    liga: liga,
                    pathToStatisticsFiles: sStatisticsPath
                });
                updateTable({
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
