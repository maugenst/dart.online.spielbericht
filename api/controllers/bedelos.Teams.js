'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var jade = require('jade');
var jsonfile = require('jsonfile');
var logger = require('../helpers/Logger');


function getTeams (req, res) {
    try {
        var sPath = path.resolve(config.get("bedelos.datapath"));
        var oSpielplan = require(sPath + '/Spielplan.json');
        var oTeams = jsonfile.readFileSync(sPath + '/Teams.json');
        var liga = req.swagger.params.liga.originalValue;

        var oResults = {};

        var oVereine = {};
        for (var spieltag in oSpielplan[liga].vr) {
            for (var spiel in oSpielplan[liga].vr[spieltag]) {
                if (oSpielplan[liga].vr[spieltag][spiel].heim) {
                    oVereine[oSpielplan[liga].vr[spieltag][spiel].heim] = {};
                }
                if (oSpielplan[liga].vr[spieltag][spiel].gast) {
                    oVereine[oSpielplan[liga].vr[spieltag][spiel].gast] = {};
                }
            }
        }

        var aVereine = Object.keys(oVereine);
        aVereine.sort();
        var html = jade.renderFile("api/views/teams.jade", {
            pretty: true,
            vereine: aVereine,
            teams: oTeams
        });

        res.status(200).send(html);

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: getTeams
};

/*        var oSpielplanNew = {
            "klnord": {
                "name": "",
                "vr": {},
                "rr": {}
            },
            "klsued": {
                "name": "",
                "vr": {},
                "rr": {}
            },
            "bzLiga": {
                "name": "",
                "vr": {},
                "rr": {}
            },
            "oberliga": {
                "name": "",
                "vr": {},
                "rr": {}
            }
        };

        Object.keys(oSpielplan).forEach(function(liga){
            oSpielplanNew[liga].name = oSpielplan[liga].name;
            for(var i = 0; i<oSpielplan[liga].spiele.vr.length; i++) {
                var sSpieltag = "spieltag_" + oSpielplan[liga].spiele.vr[i].spieltag;
                if (!oSpielplanNew[liga].vr[sSpieltag]) {
                    oSpielplanNew[liga].vr[sSpieltag] = [];
                }
                oSpielplanNew[liga].vr[sSpieltag].push({
                    id: oSpielplan[liga].spiele.vr[i].id,
                    datum: oSpielplan[liga].spiele.vr[i].datum,
                    heim: oSpielplan[liga].spiele.vr[i].heim,
                    gast: oSpielplan[liga].spiele.vr[i].gast,
                    spielfrei: oSpielplan[liga].spiele.vr[i].spielfrei
                });
            }
            for(var i = 0; i<oSpielplan[liga].spiele.rr.length; i++) {
                var sSpieltag = "spieltag_" + oSpielplan[liga].spiele.rr[i].spieltag;
                if (!oSpielplanNew[liga].rr[sSpieltag]) {
                    oSpielplanNew[liga].rr[sSpieltag] = [];
                }
                oSpielplanNew[liga].rr[sSpieltag].push({
                    id: oSpielplan[liga].spiele.rr[i].id,
                    datum: oSpielplan[liga].spiele.rr[i].datum,
                    heim: oSpielplan[liga].spiele.rr[i].heim,
                    gast: oSpielplan[liga].spiele.rr[i].gast,
                    spielfrei: oSpielplan[liga].spiele.rr[i].spielfrei
                });
            }
        });

        jsonfile.writeFileSync("test.json", oSpielplanNew, {spaces: 2});

        var oSpielplanNew = require('../../test.json');*/
