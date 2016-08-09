'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var pug = require('pug');
var jsonfile = require('jsonfile');
var crypt = require("../helpers/Crypt");
var logger = require("../helpers/Logger");
var crypto = require('crypto');
var session = require("../helpers/Session");

var sCounterFile = path.resolve(config.get("bedelos.configpath") + '/counter.json');

function getCount (req, res) {
    try {
        res.status(200).json(jsonfile.readFileSync(sCounterFile));
    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));
        logger.log.debug(error.stack);
    }
}

function increaseCount (req, res) {
    try {
        var oCounter = jsonfile.readFileSync(sCounterFile);
        oCounter.counter++;
        jsonfile.writeFileSync(sCounterFile, oCounter);
        res.status(200).json(oCounter);
    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));
        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: getCount,
    post: increaseCount
};
