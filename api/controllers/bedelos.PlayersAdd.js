'use strict';

var path = require('path');
var config = require('config');
var jsonfile = require('jsonfile');
jsonfile.spaces = 4;
var logger = require('../helpers/Logger');
var session = require('../helpers/Session');
var pug = require('pug');

function checkUserAuthentication(req, res) {
    var oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);

    if (!oSessionData) {
        res.cookie('BDL_SESSION_REDIRECT', req.url);
        res.redirect("/bedelos/login");
        return false;
    }

    if (oSessionData.username === config.get("bedelos.adminuser")) {
        res.status(200).send(pug.renderFile("api/views/authorizederror.jade"));
        return false;
    }
    return true;
}

function addToPlayers (req, res) {
    try {
        var sTeamsFile = path.resolve(config.get("bedelos.datapath") + '/Teams.json');
        var oTeams = jsonfile.readFileSync(sTeamsFile);

        if (!checkUserAuthentication(req, res)) {
            return;
        };
        var teamId = session.getUsername(req.cookies.BDL_SESSION_TOKEN);
        oTeams[teamId].mitglieder.push({
            name: req.swagger.params.name.raw,
            vorname: req.swagger.params.vorname.raw,
            encName: new Buffer(req.swagger.params.name.raw).toString('base64'),
            encVorname: new Buffer(req.swagger.params.vorname.raw).toString('base64')
        });

        jsonfile.writeFileSync(sTeamsFile, oTeams, {spaces: 4});

        res.redirect('/bedelos/teammanagement');

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: addToPlayers
};
