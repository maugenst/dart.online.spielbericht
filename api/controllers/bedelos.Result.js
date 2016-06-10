'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var jade = require('jade');
var nodemailer = require("nodemailer");
var jsonfile = require('jsonfile');
var uid = require('../helpers/UID');
var url =  require('url');
var logger = require(__dirname + "/api/helpers/Logger");

function uploadResults (req, res) {
    try {
        var oTeams = require(path.resolve(config.get("bedelos.datapath") + '/Teams.json'));
        var uniqueGameId = uid.generate();
        var sPath = path.resolve(config.get("bedelos.datapath") + "/inbox/" + uniqueGameId + "_");
        var sPicturePath = path.resolve(config.get("bedelos.datapath") + "/pictures/" + uniqueGameId + "_");
        var sSpielId = req.swagger.params.spielId.originalValue || new Date().getTime();
        var picture = req.swagger.params.picture.originalValue;
        var sPictureFilename = path.resolve(sPicturePath + sSpielId + "_" + picture.originalname);
        fs.writeFileSync(sPictureFilename, picture.buffer);
        var tcHeim = req.swagger.params.tcHeim.originalValue;

        var tcGast = req.swagger.params.tcGast.originalValue;
        var sResult = req.swagger.params.res.originalValue;
        sResult = decodeURI(sResult);
        var oResult = JSON.parse(sResult);
        oResult['picture'] = url.resolve(req.headers.origin, sPictureFilename.replace(path.resolve(config.get("bedelos.datapath")), '/saison/' + config.get("bedelos.saison")).replace(/\\/g, '/'));
        var sJsonFilename = path.resolve(sPath + sSpielId + ".json");
        jsonfile.writeFileSync(sJsonFilename, oResult, {spaces: 2});

        var html = jade.renderFile("api/views/mail.jade", {
            pretty: true,
            teams: oTeams,
            res: oResult
        });

        logger.log.info("Spielbericht erhalten für Partie: " + oResult.heim + " vs. " + oResult.gast);
        logger.log.info("   --> Game Id: " + sSpielId);
        logger.log.info("   --> Spielbericht Daten: " + sJsonFilename);
        logger.log.info("   --> Spielbericht Foto: " + sPictureFilename);
        if (os.type() === 'Linux') {
            logger.log.info("   --> Running on Linux. Trying to send Email.");
            logger.log.info("   --> Email test mode is: " + req.swagger.params.test.originalValue);

            var transporter = nodemailer.createTransport();
            logger.log.debug("Transporter created.")
            var aMailTo = [];
            var aMailCC = [];

            if (req.swagger.params.test.originalValue === "on") {
                aMailTo.push('Marius Augenstein <Marius.Augenstein@gmail.com>');
                aMailCC.push('Marius Augenstein <Marius.Augenstein@sap.com>');
            } else {
                aMailTo.push('BDL Online Spielbericht <bdlonlinespielplan@gmail.com>');
                aMailTo.push('Spielleiter BDL <spielleiter@badischedartliga.de>');
                aMailTo.push('BDL@BWDV <bdl@bwdv.de>');
                if (tcHeim!="") {
                    aMailTo.push('Teamkapitän Heim <' + tcHeim + '>');
                }
                if (tcGast!="") {
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
                to: aMailTo.join(', '),
                cc: aMailCC.join(', '),

                subject: 'BDL Online Spielberichtsbogen',
                html: html,
                attachments:[
                    {   // stream as an attachment
                        filename: 'Spielberichtsfoto.png',
                        content: fs.createReadStream(sPictureFilename)
                    }
                ]
            };

            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    throw new Error('Failed to send email: '  + error.stack);
                }

                res.status(200).send(html);
            });
        } else {
            res.status(200).send(html);
        }

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));
    }
}

module.exports = {
    post: uploadResults
};

