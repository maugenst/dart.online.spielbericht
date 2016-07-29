'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var pug = require('pug');
var jsonfile = require('jsonfile');
var walker = require('walker');
var _ = require('lodash');
var logger = require('../helpers/Logger');
var ligaHelper = require('../helpers/Liga');
var session = require('../helpers/Session');
var Spielplan = require('../helpers/Spielplan');

function checkUserAuthentication(req, res) {
    var oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);

    if (!oSessionData) {
        res.cookie('BDL_SESSION_REDIRECT', req.url);
        res.redirect("/bedelos/login");
        return false;
    }

    if (oSessionData.username !== config.get("bedelos.adminuser")) {
        res.status(200).send(pug.renderFile("api/views/authorizederror.jade"));
        return false;
    }
    return true;
}

function addToSpielplan (req, res) {
    try {

        if (!checkUserAuthentication(req, res)) {
            return;
        };

        var oGamePayload = req.swagger.params.spiel.raw;

        var sPath = path.resolve(config.get("bedelos.datapath"));
        var oTeams = jsonfile.readFileSync(sPath + '/Teams.json');

        if (!fs.existsSync(sPath + '/SpielplanNew.json')) {
            throw new Error("No new Spielplan found to add data...");
        }

        var oSpielplan = jsonfile.readFileSync(sPath + '/SpielplanNew.json');
        var oTeams = jsonfile.readFileSync(sPath + '/Teams.json');

        var spielplanHelper = new Spielplan(oSpielplan, oTeams);
        spielplanHelper.addGame(oGamePayload);
        spielplanHelper.increaseGameIndex(oGamePayload.liga);

        jsonfile.writeFileSync(sPath + '/SpielplanNew.json', spielplanHelper.getSpielplan());

        res.status(200).json(oGamePayload);
    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

function deleteFromSpielplan (req, res) {
    try {

        if (!checkUserAuthentication(req, res)) {
            return;
        };

        var sGameId = req.swagger.params.spielindex.raw;

        var sPath = path.resolve(config.get("bedelos.datapath"));

        if (!fs.existsSync(sPath + '/SpielplanNew.json')) {
            throw new Error("No new Spielplan found to remove data...");
        }

        var oSpielplan = jsonfile.readFileSync(sPath + '/SpielplanNew.json');
        var oTeams = jsonfile.readFileSync(sPath + '/Teams.json');
        
        var spielplanHelper = new Spielplan(oSpielplan, oTeams);
        spielplanHelper.removeGame(sGameId);

        jsonfile.writeFileSync(sPath + '/SpielplanNew.json', spielplanHelper.getSpielplan());

        res.status(200).json("OK");
    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

function getSpielplan (req, res) {
    try {

        if (!checkUserAuthentication(req, res)) {
            return;
        };

        var sPath = path.resolve(config.get("bedelos.datapath"));
        var oTeams = jsonfile.readFileSync(sPath + '/Teams.json');
        var spielplanHelper;
        if (!fs.existsSync(sPath + '/SpielplanNew.json')) {
            var oSpielplan = require(sPath + '/Spielplan.json');
            spielplanHelper = new Spielplan(oSpielplan, oTeams);
            spielplanHelper.initialize();            
        } else {
            var oSpielplan = jsonfile.readFileSync(sPath + '/SpielplanNew.json');
            spielplanHelper = new Spielplan(oSpielplan, oTeams);
        }

        if (req.swagger.params && req.swagger.params.spielindex) {
            var sRequestedIndex = req.swagger.params.spielindex.raw;
        }

        // aTeams is just needed for typeahead fields in form
        var aTeams = [];
        for(var team in oTeams) {
            aTeams.push({
                id: team,
                name: oTeams[team].name
            })
        }

        var html = pug.renderFile("api/views/spielplanGenerator.jade", {
            pretty: true,
            teams: oTeams,
            sTeams: JSON.stringify(aTeams),
            spielplan: oSpielplan,
            gamesMap: spielplanHelper.getGamesMapStringified()
        });

        res.status(200).send(html);

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: getSpielplan,
    post: addToSpielplan,
    delete: deleteFromSpielplan
};
