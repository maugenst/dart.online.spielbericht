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
var ligaHelper = require('../helpers/Liga');
var tabelle = require('../helpers/Tabelle');
var logger = require('../helpers/Logger');
var _ = require('lodash');
var url = require('url');

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
        var liga = ligaHelper.calcLigaFromString(sGameId);

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
        tabelle.update({
            currentResults: oCurrentResult,
            liga: liga,
            pathToTablesFiles: sTablesPath
        });

        var referrerPath = url.parse(req.headers.referer).path;
        res.redirect(referrerPath);

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));
        logger.log.debug(error.stack);
    }
}

module.exports = {
    post: wertung
};
