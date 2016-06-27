'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var jade = require('jade');
var nodemailer = require("nodemailer");
var jsonfile = require('jsonfile');
var walker = require('walker');
var _ = require('lodash');


function getSpielplan (req, res) {
    try {
        var username;
        if (req.headers && req.headers.authorization) {
            username = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString("ascii").split(':')[0];
        }
        var sPath = path.resolve(config.get("bedelos.datapath"));
        var oSpielplan = require(sPath + '/Spielplan.json');
        var oTeams = require(sPath + '/Teams.json');
        var liga = req.swagger.params.liga.originalValue;
        var runde = req.swagger.params.runde.originalValue;

        var oResults = {};

        walker(sPath + '/ergebnisse').on('file', function(file, stat) {
            if (path.extname(file) === '.json') {
                var sFilename = path.basename(file);
                var sKey = _.replace(sFilename, path.extname(file), '');
                oResults[sKey] = jsonfile.readFileSync(file);
            }
        }).on('end', function(){
            var oSelection = oSpielplan[liga][runde];

            var html = jade.renderFile("api/views/spielplan.jade", {
                pretty: true,
                runde: oSelection,
                teams: oTeams,
                username: username,
                results: oResults
            });

            res.status(200).send(html);
        });

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));
    }
}

module.exports = {
    get: getSpielplan
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
