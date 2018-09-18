'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var pug = require('pug');
var jsonfile = require('jsonfile');
var crypt = require("../helpers/Crypt");
var logger = require("../helpers/Logger");
var crypto = require('crypto');
var moment = require('moment');
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
        var sTodayDate = moment().format("YYYYMMDD");
        var oCounter = jsonfile.readFileSync(sCounterFile);
        if (oCounter.today.date != sTodayDate) {
            var oTmp = oCounter.today;
            delete oCounter.yesterday;
            delete oCounter.today;
            oCounter.yesterday = oTmp;
            oCounter.today = {
                accesses: 0,
                date: sTodayDate
            }
        }
        oCounter.today.accesses++;
        oCounter.total.accesses++;
        jsonfile.writeFileSync(sCounterFile, oCounter, {spaces: 4});
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
