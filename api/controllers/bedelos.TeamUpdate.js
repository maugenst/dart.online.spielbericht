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
var session = require('../helpers/Session');
var moment = require('moment');

function updateTeam (req, res) {
    try {
        var sTeamsFile = path.resolve(config.get("bedelos.datapath") + '/Teams.json');
        var oTeams = jsonfile.readFileSync(sTeamsFile);
        var teamId = session.getUsername(req.cookies.BDL_SESSION_TOKEN);
        var oChangedTeam = req.swagger.params.team.raw;

        oTeams[teamId].name = oChangedTeam.teamName;
        oTeams[teamId].saisontafel = oChangedTeam.teamSaisontafel;
        oTeams[teamId].spiellokal.name = oChangedTeam.teamSpiellokalName;
        oTeams[teamId].spiellokal.strasse = oChangedTeam.teamSpiellokalStrasse;
        oTeams[teamId].spiellokal.ort = oChangedTeam.teamSpiellokalOrt;
        oTeams[teamId].spiellokal.nichtraucher = oChangedTeam.teamSpiellokalNichtraucher;
        oTeams[teamId].spiellokal.jugend = oChangedTeam.teamSpiellokalJugend;
        oTeams[teamId].spiellokal.position.lat = oChangedTeam.teamSpiellokalPositionLat;
        oTeams[teamId].spiellokal.position.lng = oChangedTeam.teamSpiellokalPositionLng;
        oTeams[teamId].teamvertreter.name = oChangedTeam.teamTeamvertreterName;
        oTeams[teamId].teamvertreter.mail = oChangedTeam.teamTeamvertreterEmail;
        oTeams[teamId].teamvertreter.tel = oChangedTeam.teamTeamvertreterTelefonnummer;

        jsonfile.writeFileSync(sTeamsFile, oTeams, {spaces: 4});

        res.json("OK");

    } catch (error) {
        res.status(500).json("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    post: updateTeam
};
