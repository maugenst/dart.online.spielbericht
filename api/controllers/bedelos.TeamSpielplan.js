'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var pug = require('pug');
var jsonfile = require('jsonfile');
var walker = require('walker');
var _ = require('lodash');
var logger = require('../helpers/Logger');
var session = require('../helpers/Session');
var Spielplan = require('../helpers/Spielplan');
var moment = require('moment');

function sortBySpieltag(a, b) {
    var t1 = parseInt(a.spieltag.split('_')[1]);
    var t2 = parseInt(b.spieltag.split('_')[1]);
    if ( t1 < t2 ) {
        return -1;
    } else if (t1 === t2) {
        return 0;
    } else {
        return 1;
    }
}

function getTeamSpielplan (req, res) {

    var sPath = path.resolve(config.get("bedelos.datapath"));
    var oTeams = jsonfile.readFileSync(sPath + '/Teams.json');

    // aTeams is just needed for typeahead fields in form
    var aTeams = [];
    for(var team in oTeams) {
        aTeams.push({
            id: team,
            name: oTeams[team].name
        })
    }

    var html = pug.renderFile("api/views/teamSpielplanSelection.jade", {
        pretty: true,
        sTeams: JSON.stringify(aTeams)
    });

    res.status(200).send(html);
}

function postTeamSpielplan (req, res) {
    try {
        /*var oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);

        if (!oSessionData) {
            res.cookie('BDL_SESSION_REDIRECT', req.url);
            res.redirect("/bedelos/login");
            return;
        }

        if (oSessionData.username === config.get("bedelos.adminuser")) {
            res.status(200).send(pug.renderFile("api/views/authorizederror.jade"));
            return;
        }*/

        var teamId = req.swagger.params.teamId.raw;

        var sPath = path.resolve(config.get("bedelos.datapath"));
        if (req.swagger.params.saison.raw) {
            sPath = path.dirname(sPath);
            sPath = path.resolve(sPath, req.swagger.params.saison.raw);
        }
        var oSpielplan = require(path.resolve(sPath,'Spielplan.json'));
        var oTeams = require(path.resolve(sPath, 'Teams.json'));

        var spielplanHelper = new Spielplan(oSpielplan, oTeams);
        var aSpiele = spielplanHelper.getFilteredGamesMap({heim: teamId});
        var bSpiele = spielplanHelper.getFilteredGamesMap({gast: teamId});
        var alleSpiele = aSpiele.concat(bSpiele);
        alleSpiele.sort(sortBySpieltag);


        if (req.swagger.params.pdf && req.swagger.params.pdf.raw === "true") {

        } else {
            var html = pug.renderFile("api/views/teamspielplan.jade", {
                pretty: true,
                alleSpiele: alleSpiele,
                username: teamId,
                teams: oTeams
            });

            res.status(200).send(html);
        }
    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: getTeamSpielplan,
    post: postTeamSpielplan
};
