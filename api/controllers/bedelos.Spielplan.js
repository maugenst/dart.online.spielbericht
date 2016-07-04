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

function getSpielplan (req, res) {
    try {
        var username;
        if (req.headers && req.headers.authorization) {
            username = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString("ascii").split(':')[0];
        }
        var sPath = path.resolve(config.get("bedelos.datapath"));
        var oSpielplan = require(sPath + '/Spielplan.json');
        var oTeams = require(sPath + '/Teams.json');
        var liga = req.swagger.params.liga.originalValue;
        var runde = req.swagger.params.runde.originalValue;

        var oResults = {};

        walker(sPath + '/ergebnisse').on('file', function(file, stat) {
            if (path.extname(file) === '.json') {
                var sFilename = path.basename(file);
                var sKey = _.replace(sFilename, path.extname(file), '');
                oResults[sKey] = jsonfile.readFileSync(file);
            }
        }).on('end', function(){
            var oSelection = oSpielplan[liga][runde];

            var html = jade.renderFile("api/views/spielplan.jade", {
                pretty: true,
                runde: oSelection,
                teams: oTeams,
                username: username,
                results: oResults
            });

            res.status(200).send(html);
        });

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: getSpielplan
};
