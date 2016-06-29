'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var jade = require('jade');
var jsonfile = require('jsonfile');
var logger = require('../helpers/Logger');

function checkValue(a, b) {
    if ( a < b ) {
        return -1;
    }
    if ( a > b ) {
        return 1;
    }
    return 0;
}

function sortNames(a, b) {
    var ret = checkValue(a.name, b.name);
    if (ret === 0) {
        ret = checkValue(a.vorname, b.vorname);
    }
    return ret;
}

function listPlayers (req, res) {
    try {
        var username;
        if (req.headers && req.headers.authorization) {
            username = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString("ascii").split(':')[0];
            if (username === config.get("bedelos.adminuser")) {
                res.status(200).send(jade.renderFile("api/views/authorizederror.jade"));
                return;
            }
        }

        var sPath = path.resolve(config.get("bedelos.datapath"));
        var oTeams = jsonfile.readFileSync(sPath + '/Teams.json');
        var teamId = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString("ascii").split(':')[0];
        var aMitglieder = oTeams[teamId].mitglieder;

        aMitglieder.sort(sortNames);
        
        var html = jade.renderFile("api/views/teammanagement.jade", {
            pretty: true,
            players: aMitglieder,
            teams: oTeams,
            teamId: teamId
        });

        res.status(200).send(html);

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: listPlayers
};
