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
var moment = require('moment');


function checkAuthentication (req, res) {
    try {
        var oSession = session.get(req.cookies.BDL_SESSION_TOKEN);

        if (oSession) {
            res.status(200).json("OK");
        } else {
            res.status(401).json("UNAUTHORIZED");
        }
    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: checkAuthentication
};
