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

function getSpielplan (req, res) {
    try {
        var username = session.getUsername(req.cookies.BDL_SESSION_TOKEN);
        var sPath = path.resolve(config.get("bedelos.datapath"));
        if (req.swagger.params.saison.raw) {
            sPath = path.dirname(sPath);
            sPath = path.resolve(sPath, req.swagger.params.saison.raw);
        }
        var oSpielplan = require(path.resolve(sPath,'Spielplan.json'));
        var oTeams = require(path.resolve(sPath, 'Teams.json'));
        var liga = req.swagger.params.liga.raw;
        var runde = req.swagger.params.runde.raw;

        var oResults = {};

        walker(sPath + '/ergebnisse').on('file', function(file, stat) {
            if (path.extname(file) === '.json') {
                var sFilename = path.basename(file);
                var sKey = _.replace(sFilename, path.extname(file), '');
                oResults[sKey] = jsonfile.readFileSync(file);
            }
        }).on('end', function(){
            if (oSpielplan[liga]) {
                var oSelection = oSpielplan[liga][runde];

                var html = pug.renderFile("api/views/spielplan.jade", {
                    pretty: true,
                    runde: oSelection,
                    teams: oTeams,
                    username: username,
                    results: oResults
                });

                res.status(200).send(html);
            } else {
                res.send('NOT FOUND').status(404);
            }
        });

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: getSpielplan
};
