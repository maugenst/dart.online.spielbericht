'use strict';

let util = require('util');
let path = require('path');
let config = require('config');
let os = require('os');
let fs = require('fs');
let pug = require('pug');
let jsonfile = require('jsonfile');
let walker = require('walker');
let _ = require('lodash');
let logger = require('../helpers/Logger');
let ligaHelper = require('../helpers/Liga');
let session = require('../helpers/Session');
let Spielplan = require('../helpers/Spielplan');

function checkUserAuthentication(req, res) {
    let oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);

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

        let oGamePayload = req.swagger.params.spiel.raw;

        let sPath = path.resolve(config.get("bedelos.datapath"));
        let oTeams = jsonfile.readFileSync(sPath + '/Teams.json');

        if (!fs.existsSync(sPath + '/SpielplanNew.json')) {
            throw new Error("No new Spielplan found to add data...");
        }

        let oSpielplan = jsonfile.readFileSync(sPath + '/SpielplanNew.json');
        oTeams = jsonfile.readFileSync(sPath + '/Teams.json');

        let spielplanHelper = new Spielplan(oSpielplan, oTeams);
        spielplanHelper.addGame(oGamePayload);
        spielplanHelper.increaseGameIndex(oGamePayload.liga);

        jsonfile.writeFileSync(sPath + '/SpielplanNew.json', spielplanHelper.getSpielplan(), {spaces: 4});

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

        let sGameId = req.swagger.params.spielindex.raw;

        let sPath = path.resolve(config.get("bedelos.datapath"));

        if (!fs.existsSync(sPath + '/SpielplanNew.json')) {
            throw new Error("No new Spielplan found to remove data...");
        }

        let oSpielplan = jsonfile.readFileSync(sPath + '/SpielplanNew.json');
        let oTeams = jsonfile.readFileSync(sPath + '/Teams.json');
        
        let spielplanHelper = new Spielplan(oSpielplan, oTeams);
        spielplanHelper.removeGame(sGameId);

        jsonfile.writeFileSync(sPath + '/SpielplanNew.json', spielplanHelper.getSpielplan(), {spaces: 4});

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

        let sPath = path.resolve(config.get("bedelos.datapath"));
        let oTeams = jsonfile.readFileSync(sPath + '/Teams.json');
        let spielplanHelper;
        let oSpielplan = null;
        if (!fs.existsSync(sPath + '/SpielplanNew.json')) {
            spielplanHelper = new Spielplan({}, oTeams);
            spielplanHelper.initialize();
            oSpielplan = spielplanHelper.getSpielplan();
            jsonfile.writeFileSync(sPath + '/SpielplanNew.json', oSpielplan, {spaces: 4});
        } else {
            oSpielplan = jsonfile.readFileSync(sPath + '/SpielplanNew.json');
            spielplanHelper = new Spielplan(oSpielplan, oTeams);
        }

        if (req.swagger.params && req.swagger.params.spielindex) {
            let sRequestedIndex = req.swagger.params.spielindex.raw;
        }

        // aTeams is just needed for typeahead fields in form
        let aTeams = [];
        for(let team in oTeams) {
            aTeams.push({
                id: team,
                name: oTeams[team].name.replace(/"/g, '')
            })
        }

        let oLigen = config.get('bedelos.ligen');

        let html = pug.renderFile("api/views/spielplanGenerator.jade", {
            pretty: true,
            teams: oTeams,
            sTeams: JSON.stringify(aTeams),
            oLigen: oLigen,
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
