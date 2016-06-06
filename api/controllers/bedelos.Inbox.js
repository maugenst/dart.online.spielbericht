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


function listInbox (req, res) {
    try {
        var sPath = path.resolve(config.get("bedelos.datapath"));
        var oTeams = require(sPath + '/Teams.json');

        var oResults = {};

        walker(sPath + '/inbox').on('file', function(file, stat) {
            if (path.extname(file) === '.json') {
                var sFilename = path.basename(file);
                var sKey = _.replace(sFilename, path.extname(file), '');
                oResults[sKey] = require(file);
            }
        }).on('end', function(){
            var html = jade.renderFile("api/views/inbox.jade", {
                pretty: true,
                teams: oTeams,
                results: oResults
            });

            res.status(200).send(html);
        });

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));
    }
}

module.exports = {
    get: listInbox
};
