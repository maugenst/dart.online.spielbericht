'use strict';

var config = require('config');
var os = require('os');
var logger = require('../helpers/Logger');

function listInfo (req, res) {
    try {
        res.json({
            os: {
                os: os.hostname(),
                type: os.type()
            },
            node: {
                version: process.version
            },
            bedelos: config.get('bedelos')
        });
    } catch (error) {
        res.send(500, "Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: listInfo
};

