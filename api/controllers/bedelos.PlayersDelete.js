'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var jsonfile = require('jsonfile');
var jade = require('jade');
jsonfile.spaces = 4;
var logger = require('../helpers/Logger');
var session = require('../helpers/Session');


function checkUserAuthentication(req, res) {
    var oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);

    if (!oSessionData) {
        res.cookie('BDL_SESSION_REDIRECT', req.url);
        res.redirect("/bedelos/login");
        return false;
    }

    if (oSessionData.username === config.get("bedelos.adminuser")) {
        res.status(200).send(jade.renderFile("api/views/authorizederror.jade"));
        return false;
    }
    return true;
}

function listPlayers (req, res) {
    try {
        var sTeamsFile = path.resolve(config.get("bedelos.datapath") + '/Teams.json');
        var oTeams = jsonfile.readFileSync(sTeamsFile);

        if (!checkUserAuthentication(req, res)) {
            return;
        };

        for (var i = 0; i<oTeams[teamId].mitglieder.length; i++) {
            if (oTeams[teamId].mitglieder[i].encName === req.swagger.params.encname.originalValue &&
                oTeams[teamId].mitglieder[i].encVorname === req.swagger.params.encvorname.originalValue) {
                oTeams[teamId].mitglieder.splice(i, 1);
                break;
            }
        }

        jsonfile.writeFileSync(sTeamsFile, oTeams);

        res.redirect('/bedelos/teammanagement');

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: listPlayers
};
