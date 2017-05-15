'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var pug = require('pug');
var jsonfile = require('jsonfile');
var crypt = require("../helpers/Crypt");
var logger = require("../helpers/Logger");
var crypto = require('crypto');
var uid = require("../helpers/UID");

let sFile = path.resolve(config.get("bedelos.datapath") + '/TurnierSpieler.json');

function getInputform (req, res) {
    try {

        let oPlayers = jsonfile.readFileSync(sFile);

        var html = pug.renderFile("api/views/tournament.inputform.pug", {
            pretty: true,
            players: oPlayers
        });

        res.status(200).send(html);

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

function save(req, res) {
    try {

        var vorname = req.swagger.params.credentials.raw.vorname;
        var nachname = req.swagger.params.credentials.raw.nachname;

        let oPlayers = jsonfile.readFileSync(sFile);

        oPlayers[uid.generate()] = {
            vorname: vorname,
            nachname: nachname
        };
        jsonfile.writeFileSync(sFile, oPlayers);
        var html = pug.renderFile("api/views/tournament.inputform.pug", {
            pretty: true,
            players: oPlayers
        });

        res.status(200).send(html);

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));
        logger.log.debug(error.stack);
    }
}

function delEntry(req, res) {
    try {

        var id = req.swagger.params.id.raw;

        let oPlayers = jsonfile.readFileSync(sFile);

        delete oPlayers[id];
        jsonfile.writeFileSync(sFile, oPlayers);
        var html = pug.renderFile("api/views/tournament.inputform.pug", {
            pretty: true,
            players: oPlayers
        });

        res.status(200).send(html);

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));
        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: getInputform,
    post: save,
    delete: delEntry
};
