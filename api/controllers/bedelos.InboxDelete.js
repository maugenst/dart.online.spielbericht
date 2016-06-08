'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var jade = require('jade');
var nodemailer = require("nodemailer");
var jsonfile = require('jsonfile');
var walker = require('walker');
var _ = require('lodash');

function inboxDelete (req, res) {
    try {
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
    }
}

module.exports = {
    get: inboxDelete
};
