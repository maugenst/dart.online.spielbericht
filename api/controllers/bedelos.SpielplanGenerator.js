'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var jade = require('jade');
var jsonfile = require('jsonfile');
var walker = require('walker');
var _ = require('lodash');
var logger = require('../helpers/Logger');
var ligaHelper = require('../helpers/Liga');
var session = require('../helpers/Session');

function addToSpielplan (req, res) {
    try {

        var oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);

        if (!oSessionData) {
            res.redirect("/bedelos/login");
            return;
        }

        if (oSessionData.username !== config.get("bedelos.adminuser")) {
            res.status(200).send(jade.renderFile("api/views/authorizederror.jade"));
            return;
        }

        var oGamePayload = req.swagger.params.spiel.originalValue;

        var sPath = path.resolve(config.get("bedelos.datapath"));
        var oTeams = jsonfile.readFileSync(sPath + '/Teams.json');

        if (!fs.existsSync(sPath + '/SpielplanNew.json')) {
            throw new Error("No new Spielplan found to add data...");
        }

        var oSpielplan = jsonfile.readFileSync(sPath + '/SpielplanNew.json');

        var oSpiel = {
            "id": oGamePayload.spielIndex,
            "datum": oGamePayload.datum
        };
        if (oGamePayload.spielfrei) {
            oSpiel.spielfrei = oGamePayload.spielfrei
        } else {
            oSpiel.heim = oGamePayload.heim;
            oSpiel.gast = oGamePayload.gast;
        }
        oSpielplan[oGamePayload.liga][oGamePayload.runde]['spieltag_'+oGamePayload.spieltag].push(oSpiel);
        oSpielplan[oGamePayload.liga].iCurrentGameIndex++;
        oSpielplan[oGamePayload.liga].nextGameIndex = ligaHelper.getGameIndex(oGamePayload.liga, oSpielplan[oGamePayload.liga].iCurrentGameIndex);

        jsonfile.writeFileSync(sPath + '/SpielplanNew.json', oSpielplan);

        res.status(200).json(oGamePayload);
    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

function getSpielplan (req, res) {
    try {

        var oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);

        if (!oSessionData) {
            res.redirect("/bedelos/login");
            return;
        }

        if (oSessionData.username !== config.get("bedelos.adminuser")) {
            res.status(200).send(jade.renderFile("api/views/authorizederror.jade"));
            return;
        }

        var sPath = path.resolve(config.get("bedelos.datapath"));
        var oTeams = jsonfile.readFileSync(sPath + '/Teams.json');

        if (!fs.existsSync(sPath + '/SpielplanNew.json')) {
            var oSpielplan = require(sPath + '/Spielplan.json');
            for(var liga in oSpielplan) {
                for (var spieltag in oSpielplan[liga].vr) {
                    oSpielplan[liga].vr[spieltag] = [];
                }
                for (var spieltag in oSpielplan[liga].rr) {
                    oSpielplan[liga].rr[spieltag] = [];
                }
                oSpielplan[liga].iCurrentGameIndex = 1;
                oSpielplan[liga].nextGameIndex = ligaHelper.getGameIndex(liga, oSpielplan[liga].iCurrentGameIndex);
            }
            jsonfile.writeFileSync(sPath + '/SpielplanNew.json', oSpielplan);
        }

        var oSpielplan = jsonfile.readFileSync(sPath + '/SpielplanNew.json');

        var aTeams = [];
        for(var team in oTeams) {
            aTeams.push({
                id: team,
                name: oTeams[team].name
            })
        }

        var html = jade.renderFile("api/views/spielplanGenerator.jade", {
            pretty: true,
            teams: oTeams,
            sTeams: JSON.stringify(aTeams),
            spielplan: oSpielplan,
            saison: config.get("bedelos.saison")
        });

        res.status(200).send(html);

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: getSpielplan,
    post: addToSpielplan
};
