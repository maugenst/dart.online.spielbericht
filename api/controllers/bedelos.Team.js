'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var pug = require('pug');
var jsonfile = require('jsonfile');
var logger = require('../helpers/Logger');


function getTeam (req, res) {
    try {
        var sPath = path.resolve(config.get("bedelos.datapath"));
        var oSpielplan = require(sPath + '/Spielplan.json');
        var oTeams = jsonfile.readFileSync(sPath + '/Teams.json');

        var html = pug.renderFile("api/views/teams.jade", {
            pretty: true,
            vereine: [req.swagger.params.teamId.raw],
            teams: oTeams
        });

        res.status(200).send(html);

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: getTeam
};
