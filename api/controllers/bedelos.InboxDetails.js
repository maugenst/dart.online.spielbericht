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
var logger = require('../helpers/Logger');


function inboxDetails (req, res) {
    try {
        var username;
        if (req.headers && req.headers.authorization) {
            username = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString("ascii").split(':')[0];
            if (username !== config.get("bedelos.adminuser")) {
                throw new Error("User not authenticated.");
            }
        }
        var sPath = path.resolve(config.get("bedelos.datapath"));
        var oTeams = require(sPath + '/Teams.json');

        var oResult = require(path.resolve(sPath + "/inbox/" + req.swagger.params.gameId.originalValue + ".json"));
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
    get: inboxDetails
};
