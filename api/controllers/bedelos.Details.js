'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var jade = require('jade');
var jsonfile = require('jsonfile');
var logger = require("../helpers/Logger");

function details (req, res) {
    try {
        var sPath = path.resolve(config.get("bedelos.datapath"));
        var oTeams = require(sPath + '/Teams.json');

        var oResults = {};
        logger.log.debug("Displaying details on: " + req.swagger.params.gameId.originalValue);
        var sResultFile = path.resolve(sPath + "/"+req.swagger.params.storage.originalValue + "/" + req.swagger.params.gameId.originalValue + ".json");

        logger.log.debug(" ResultFile: " + sResultFile);
        var oResult = require(sResultFile);
        logger.log.debug(oResult);
        var html = jade.renderFile("api/views/mail.jade", {
            pretty: true,
            teams: oTeams,
            res: oResult
        });

        res.status(200).send(html);

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: details
};
