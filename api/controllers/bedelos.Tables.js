'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var jade = require('jade');
var nodemailer = require("nodemailer");
var jsonfile = require('jsonfile');
var _ = require('lodash');
var ranking = require('../helpers/Ranking.js');

function getTable (req, res) {
    try {
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
            teams: oTeams
        });

        res.status(200).send(html);

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));
    }
}

module.exports = {
    get: getTable
};
