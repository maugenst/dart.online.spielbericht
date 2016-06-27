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
var uid = require('../helpers/UID');
var _ = require('lodash');
var url = require('url');


function calcLigaFromGameId(gameId) {
    if (gameId.startsWith('kls')) {
        return 'klsued';
    } else if (gameId.startsWith('kln')) {
        return 'klnord';
    } else if (gameId.startsWith('bzli')) {
        return 'bzLiga';
    } else if (gameId.startsWith('ol')) {
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

function gameDetails(gameId, oSpielplan, liga){
    for (var spieltag in oSpielplan[liga].vr) {
        for (var spiel in oSpielplan[liga].vr[spieltag]) {
            if (oSpielplan[liga].vr[spieltag][spiel].id === gameId) {
                return oSpielplan[liga].vr[spieltag][spiel];
            }
        }
    }
    for (var spieltag in oSpielplan[liga].rr) {
        for (var spiel in oSpielplan[liga].rr[spieltag]) {
            if (oSpielplan[liga].rr[spieltag][spiel].id === gameId) {
                return oSpielplan[liga].rr[spieltag][spiel];
            }
        }
    }
    return {};
}
function setResult(oCurrentResult, heim, gast) {
    oCurrentResult.summary.heim.sets = heim;
    oCurrentResult.summary.gast.sets = gast;
}

function wertung (req, res) {
    try {
        var uniqueGameId = uid.generate();
        var sPath = path.resolve(config.get("bedelos.datapath"));
        var sTablesPath = path.resolve(sPath + '/tabellen/');
        var oTeams = require(sPath + '/Teams.json');
        var oSpielplan = require(sPath + '/Spielplan.json');
        var sGameId = req.swagger.params.gameId.originalValue;
        var oCurrentResult = jsonfile.readFileSync(sPath + '/Wertung.json');
        var liga = calcLigaFromGameId(sGameId);

        var oGameDetails = gameDetails(sGameId, oSpielplan, liga);
        oCurrentResult.heim = oGameDetails.heim;
        oCurrentResult.gast = oGameDetails.gast;


        switch(req.swagger.params.wertung.originalValue.value) {
            case '0': setResult(oCurrentResult, 0, 0);
                break;
            case '1': setResult(oCurrentResult, 0, 12);
                break;
            case '2': setResult(oCurrentResult, 1, 11);
                break;
            case '3': setResult(oCurrentResult, 2, 10);
                break;
            case '4': setResult(oCurrentResult, 3, 9);
                break;
            case '5': setResult(oCurrentResult, 4, 8);
                break;
            case '6': setResult(oCurrentResult, 5, 7);
                break;
            case '7': setResult(oCurrentResult, 6, 6);
                break;
            case '8': setResult(oCurrentResult, 7, 5);
                break;
            case '9': setResult(oCurrentResult, 8, 4);
                break;
            case '10': setResult(oCurrentResult, 9, 3);
                break;
            case '11': setResult(oCurrentResult, 10, 2);
                break;
            case '12': setResult(oCurrentResult, 11, 1);
                break;
            case '13': setResult(oCurrentResult, 12, 0);
                break;
        }

        var newName = path.resolve(sPath + '/inbox/' + uniqueGameId + "_" + sGameId + ".json");
        jsonfile.writeFileSync(newName, oCurrentResult);
        updateTable({
            currentResults: oCurrentResult,
            liga: liga,
            pathToTablesFiles: sTablesPath
        });

        var referrerPath = url.parse(req.headers.referer).path;
        res.redirect(referrerPath);

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));
    }
}

module.exports = {
    post: wertung
};
