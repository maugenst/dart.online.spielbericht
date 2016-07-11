'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var fs = require('fs');
var jsonfile = require('jsonfile');
var walker = require('walker');
var logger = require('../helpers/Logger');
var session = require('../helpers/Session');
var jade = require('jade');

function inboxDelete (req, res) {
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
