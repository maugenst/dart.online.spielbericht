'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var jsonfile = require('jsonfile');
jsonfile.spaces = 4;
var logger = require('../helpers/Logger');

function listPlayers (req, res) {
    try {
        var sTeamsFile = path.resolve(config.get("bedelos.datapath") + '/Teams.json');
        var oTeams = jsonfile.readFileSync(sTeamsFile);
        var teamId = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString("ascii").split(':')[0];

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
