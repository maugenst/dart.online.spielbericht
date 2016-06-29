'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var fs = require('fs');
var jsonfile = require('jsonfile');
var walker = require('walker');
var logger = require('../helpers/Logger');

function inboxDelete (req, res) {
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

        var sGameId = req.swagger.params.gameId.originalValue;

        walker(sPath + '/inbox').on('file', function(file, stat) {
            if (path.basename(file).indexOf(sGameId) === 0) {
                fs.unlinkSync(file);
            }
        }).on('end', function() {
            res.redirect('/bedelos/inbox');
        });

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: inboxDelete
};
