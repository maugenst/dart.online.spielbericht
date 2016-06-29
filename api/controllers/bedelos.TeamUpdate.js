'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var nodemailer = require("nodemailer");
var jsonfile = require('jsonfile');
jsonfile.spaces = 4;
var logger = require('../helpers/Logger');

function updateTeam (req, res) {
    try {
        var sTeamsFile = path.resolve(config.get("bedelos.datapath") + '/Teams.json');
        var oTeams = jsonfile.readFileSync(sTeamsFile);
        var teamId = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString("ascii").split(':')[0];
        var oChangedTeam = req.swagger.params.team.originalValue;

        oTeams[teamId].name = oChangedTeam.teamName;
        oTeams[teamId].spiellokal.name = oChangedTeam.teamSpiellokalName;
        oTeams[teamId].spiellokal.strasse = oChangedTeam.teamSpiellokalStrasse;
        oTeams[teamId].spiellokal.ort = oChangedTeam.teamSpiellokalOrt;
        oTeams[teamId].spiellokal.position.lat = oChangedTeam.teamSpiellokalPositionLat;
        oTeams[teamId].spiellokal.position.lng = oChangedTeam.teamSpiellokalPositionLng;
        oTeams[teamId].teamvertreter.name = oChangedTeam.teamTeamvertreterName;
        oTeams[teamId].teamvertreter.mail = oChangedTeam.teamTeamvertreterEmail;
        oTeams[teamId].teamvertreter.tel = oChangedTeam.teamTeamvertreterTelefonnummer;

        jsonfile.writeFileSync(sTeamsFile, oTeams);

        res.redirect('/bedelos/teammanagement');

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    post: updateTeam
};
