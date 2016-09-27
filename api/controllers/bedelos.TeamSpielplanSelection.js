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

function getTeamSpielplanSelectionScreen (req, res) {

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

module.exports = {
    get: getTeamSpielplanSelectionScreen
};
