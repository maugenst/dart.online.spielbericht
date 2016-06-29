'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var nodemailer = require("nodemailer");
var jsonfile = require('jsonfile');
var jade = require('jade');
jsonfile.spaces = 4;
var logger = require("../helpers/Logger");
var walker = require('walker');

function inboxReject (req, res) {
    try {
        var username;
        if (req.headers && req.headers.authorization) {
            username = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString("ascii").split(':')[0];
            if (username !== config.get("bedelos.adminuser")) {
                throw new Error("User not authenticated.");
            }
        }
        var sPath = path.resolve(config.get("bedelos.datapath"));
        var sStatisticsPath = path.resolve(config.get("bedelos.datapath") + '/statistiken/');
        var sTablesPath = path.resolve(config.get("bedelos.datapath") + '/tabellen/');
        var oTeams = require(sPath + '/Teams.json');

        var sGameId = req.swagger.params.gameId.originalValue;

        var file = path.resolve(sPath + "/inbox/" + req.swagger.params.gameId.originalValue + ".json");
        var oResult = require(file);
        var html = jade.renderFile("api/views/mail.jade", {
            pretty: true,
            teams: oTeams,
            message: "<b>FEHLER: Der unten angehängte Spielberichtsbogen wurde vom Spielleiter der BDL " +
                "abgelehnt und gelöscht, weil Fehler gefunden wurden. " +
                "Bitte Spielbericht überprüfen und neu erfassen.</b>",
            res: oResult
        });

        var tcHeim = oTeams[oResult.heim].teamvertreter.mail;
        var tcGast = oTeams[oResult.gast].teamvertreter.mail;

        if (os.type() === 'Linux') {
            var transporter = nodemailer.createTransport();
            logger.log.debug("Transporter created.");
            var aMailTo = [];
            var aMailCC = [];

            if (req.swagger.params.test.originalValue === "on") {
                aMailTo.push('Marius Augenstein <Marius.Augenstein@gmail.com>');
                aMailCC.push('Marius Augenstein <Marius.Augenstein@sap.com>');
            } else {
                aMailTo.push('BDL Online Spielbericht <bdlonlinespielplan@gmail.com>');
                aMailTo.push('Spielleiter BDL <spielleiter@badischedartliga.de>');
                aMailTo.push('BDL@BWDV <bdl@bwdv.de>');
                if (tcHeim!=="") {
                    aMailTo.push('Teamkapitän Heim <' + tcHeim + '>');
                }
                if (tcGast!=="") {
                    aMailTo.push('Teamkapitän Gast <' + tcGast + '>');
                }
                aMailCC.push('Dominik Boss <odom3003@googlemail.com>');

                aMailCC.push('Jochen Becker <jb@jankovsky.de>');
                aMailCC.push('Marius Augenstein <Marius.Augenstein@gmail.com>');
            }
            logger.log.debug("Sending to: " + aMailTo);
            logger.log.debug("Sending cc: " + aMailCC);

            var mailOptions = {
                from: 'BDL Online Spielbericht <bdlonlinespielplan@gmail.com>',
                to: '\'' + aMailTo.join(', ') + '\'',
                cc: '\'' + aMailCC.join(', ') + '\'',

                subject: 'BDL Online Spielberichtsbogen abgelehnt - Bitte überprüfen und neu erfassen',
                html: html,
                attachments:[
                    {   // stream as an attachment
                        filename: 'Spielberichtsfoto.png',
                        content: fs.createReadStream(oResult.picture)
                    }
                ]
            };

            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    throw new Error('Failed to send email: '  + error.stack);
                }

                res.status(200).send(html);
            });
        }

        fs.unlinkSync(file);

        res.redirect('/bedelos/inbox');

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: inboxReject
};
