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
var session = require('../helpers/Session');


function inboxDetails (req, res) {
    try {
        var oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);

        if (!oSessionData) {
            res.redirect("/bedelos/login");
            return;
        }

        if (oSessionData.username !== config.get("bedelos.adminuser")) {
            res.status(200).send(jade.renderFile("api/views/authorizederror.jade"));
            return;
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
