'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var pug = require('pug');
var jsonfile = require('jsonfile');
var logger = require('../helpers/Logger');


function getTeams (req, res) {
    try {
        var sPath = path.resolve(config.get("bedelos.datapath"));
        var oSpielplan = require(sPath + '/Spielplan.json');
        var oTeams = jsonfile.readFileSync(sPath + '/Teams.json');
        var liga = req.swagger.params.liga.raw;

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
        var html = pug.renderFile("api/views/teams.jade", {
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
