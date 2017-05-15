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

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function get (req, res) {
    try {

        let oPlayers = jsonfile.readFileSync(sFile);
        let aPlayers = [];
        let aKeys = Object.keys(oPlayers);

        aKeys.forEach(key => {
           aPlayers.push(`${oPlayers[key].vorname} ${oPlayers[key].nachname}`);
        });
        let boards = 0;

        shuffle(aPlayers);

        if (aKeys.length % 4 !== 0) {
            boards = Math.floor(aKeys.length / 4) + 1;
            for(let j = 0; j<(4 - aKeys.length % 4); j++) {
                aPlayers.push(`Freilos_${j}`);
            }
        } else {
            boards = aKeys.length / 4
        }
        var html = pug.renderFile("api/views/tournament.randomView.pug", {
            pretty: true,
            players: aPlayers,
            boards: boards
        });

        res.status(200).send(html);

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: get
};
