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

function addToSpielplan (req, res) {
    res.status(200).send("OK");
}

function getSpielplan (req, res) {
    try {
        var sPath = path.resolve(config.get("bedelos.datapath"));
        var oSpielplan = require(sPath + '/Spielplan.json');
        var oTeams = jsonfile.readFileSync(sPath + '/Teams.json');

        var aTeams = [];
        for(var team in oTeams) {
            aTeams.push({
                id: team,
                name: oTeams[team].name
            })
        }

        var html = jade.renderFile("api/views/spielplanGenerator.jade", {
            pretty: true,
            sTeams: JSON.stringify(aTeams)
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
