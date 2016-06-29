'use strict';

var path = require('path');
var config = require('config');
var jsonfile = require('jsonfile');
jsonfile.spaces = 4;
var logger = require('../helpers/Logger');

function addToPlayers (req, res) {
    try {
        var sTeamsFile = path.resolve(config.get("bedelos.datapath") + '/Teams.json');
        var oTeams = jsonfile.readFileSync(sTeamsFile);
        var teamId = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString("ascii").split(':')[0];

        oTeams[teamId].mitglieder.push({
            name: req.swagger.params.name.originalValue,
            vorname: req.swagger.params.vorname.originalValue,
            encName: new Buffer(req.swagger.params.name.originalValue).toString('base64'),
            encVorname: new Buffer(req.swagger.params.vorname.originalValue).toString('base64')
        });

        jsonfile.writeFileSync(sTeamsFile, oTeams);

        res.redirect('/bedelos/teammanagement');

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: addToPlayers
};
