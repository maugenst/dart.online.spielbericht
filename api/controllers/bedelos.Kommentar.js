'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var nodemailer = require("nodemailer");
var jsonfile = require('jsonfile');
jsonfile.spaces = 4;
var walker = require('walker');
var uid = require('../helpers/UID');
var ligaHelper = require('../helpers/Liga');
var tabelle = require('../helpers/Tabelle');
var logger = require('../helpers/Logger');
var _ = require('lodash');
var url = require('url');
var session = require('../helpers/Session');
var pug = require('pug');

function getComment (req, res) {
    var oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);

    if (!oSessionData) {
        res.cookie('BDL_SESSION_REDIRECT', req.url);
        res.redirect("/bedelos/login");
        return;
    }

    if (oSessionData.username !== config.get("bedelos.adminuser")) {
        res.status(200).send(pug.renderFile("api/views/authorizederror.jade"));
        return;
    }

    var oResults = {};
    var sPath = path.resolve(config.get("bedelos.datapath"));
    var sResultFile = path.resolve(sPath + "/" + req.swagger.params.storage.raw + "/" + req.swagger.params.gameId.raw + ".json");

    var oTeams = require(sPath + '/Teams.json');
    var oResults = {};
    var sPath = path.resolve(config.get("bedelos.datapath"));
    var sResultFile = path.resolve(sPath + "/" + req.swagger.params.storage.raw + "/" + req.swagger.params.gameId.raw + ".json");
    var oResult = jsonfile.readFileSync(sResultFile);


    var html = pug.renderFile("api/views/comment.jade", {
        pretty: true,
        storage: req.swagger.params.storage.raw,
        gameId: req.swagger.params.gameId.raw,
        comment: (oResult.comment) ? JSON.parse(oResult.comment) : "",
        oResult: oResult,
        oTeams: oTeams
    });

    res.status(200).send(html);


}

function removeComment (req, res) {
    try {

        var oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);

        if (!oSessionData) {
            res.cookie('BDL_SESSION_REDIRECT', req.url);
            res.redirect("/bedelos/login");
            return;
        }

        if (oSessionData.username !== config.get("bedelos.adminuser")) {
            res.status(200).send(pug.renderFile("api/views/authorizederror.jade"));
            return;
        }

        var oResults = {};
        var sPath = path.resolve(config.get("bedelos.datapath"));
        var sResultFile = path.resolve(sPath + "/" + req.swagger.params.storage.raw + "/" + req.swagger.params.gameId.raw + ".json");

        var oResult = jsonfile.readFileSync(sResultFile);
        delete oResult.comment;
        var oResult = jsonfile.writeFileSync(sResultFile, oResult, {spaces: 4});

        res.status(200).send("OK");

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));
        logger.log.debug(error.stack);
    }
}

function addComment (req, res) {
    try {

        var oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);

        if (!oSessionData) {
            res.cookie('BDL_SESSION_REDIRECT', req.url);
            res.redirect("/bedelos/login");
            return;
        }

        if (oSessionData.username !== config.get("bedelos.adminuser")) {
            res.status(200).send(pug.renderFile("api/views/authorizederror.jade"));
            return;
        }

        var oResults = {};
        var sPath = path.resolve(config.get("bedelos.datapath"));
        var sResultFile = path.resolve(sPath + "/" + req.swagger.params.storage.raw + "/" + req.swagger.params.gameId.raw + ".json");

        var oResult = jsonfile.readFileSync(sResultFile);
        oResult['comment'] = JSON.stringify(req.swagger.params.comment.raw);
        var oResult = jsonfile.writeFileSync(sResultFile, oResult, {spaces: 4});

        res.redirect("/bedelos/"+req.swagger.params.storage.raw + "/" + req.swagger.params.gameId.raw);

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));
        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: getComment,
    post: addComment,
    delete: removeComment
};
