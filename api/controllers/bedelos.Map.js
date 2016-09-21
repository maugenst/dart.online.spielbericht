'use strict';
var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var pug = require('pug');
var jsonfile = require('jsonfile');
var logger = require('../helpers/Logger');

function listInbox (req, res) {
    try {
        var sPath = path.resolve(config.get("bedelos.datapath"));
        var oTeams = require(sPath + '/Teams.json');

        var aLocations = [];
        for(var teamId in oTeams) {
            var aTeam = [];
            aTeam.push("'<b>" + oTeams[teamId].name + "</b><br><i>" +
                oTeams[teamId].spiellokal.name + "<br>" +
                oTeams[teamId].spiellokal.strasse + "<br>" +
                oTeams[teamId].spiellokal.ort + "</i>'");
            aTeam.push(oTeams[teamId].spiellokal.position.lat);
            aTeam.push(oTeams[teamId].spiellokal.position.lng);
            aLocations.push(aTeam);
        }

        var html = pug.renderFile("api/views/map.jade", {
            pretty: true,
            locations: aLocations
        });

        res.status(200).send(html);

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: listInbox
};
