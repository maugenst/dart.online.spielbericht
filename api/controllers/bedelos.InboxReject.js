'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var nodemailer = require("nodemailer");
var jsonfile = require('jsonfile');
var pug = require('pug');
jsonfile.spaces = 4;
var logger = require("../helpers/Logger");
var session = require("../helpers/Session");
var walker = require('walker');

function inboxReject (req, res) {
    try {
        var oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);

        if (!oSessionData) {
            res.cookie('BDL_SESSION_REDIRECT', req.url);
            res.redirect("/bedelos/login");
            return;
        }

        if (oSessionData.username !== config.get("bedelos.adminuser")) {
            res.status(200).send(pug.renderFile("api/views/authorizederror.jade"));
            return;
        }

        var sPath = path.resolve(config.get("bedelos.datapath"));
        var sStatisticsPath = path.resolve(config.get("bedelos.datapath") + '/statistiken/');
        var sTablesPath = path.resolve(config.get("bedelos.datapath") + '/tabellen/');
        var oTeams = require(sPath + '/Teams.json');

        var sGameId = req.swagger.params.gameId.raw;

        var file = path.resolve(sPath + "/inbox/" + req.swagger.params.gameId.raw + ".json");
        var oResult = require(file);
        var html = pug.renderFile("api/views/mail.jade", {
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

            if (req.swagger.params.test.raw === "on") {
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
