'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var jade = require('jade');
var jsonfile = require('jsonfile');
var ranking = require('../helpers/Ranking');
var ligaHelper = require('../helpers/Liga');
var logger = require('../helpers/Logger');

function getTable (req, res) {
    try {
        var username;
        if (req.headers && req.headers.authorization) {
            username = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString("ascii").split(':')[0];
        }

        var sPath = path.resolve(config.get("bedelos.datapath"));
        var sTablesPath = path.resolve(config.get("bedelos.datapath") + '/tabellen/');
        var oTeams = require(sPath + '/Teams.json');
        var liga = req.swagger.params.liga.originalValue;
        var sTableFile = path.resolve(sTablesPath + '/' + liga + '.json');
        var oTabelle = jsonfile.readFileSync(sTableFile);

        var aRanking = ranking.sortTableByRank(oTabelle);

        var html = jade.renderFile("api/views/tables.jade", {
            pretty: true,
            ranking: aRanking,
            teams: oTeams,
            username: username,
            liga: ligaHelper.getFullLigaName(liga)
        });

        res.status(200).send(html);

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: getTable
};
