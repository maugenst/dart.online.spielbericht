'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var jade = require('jade');
var nodemailer = require("nodemailer");
var jsonfile = require('jsonfile');

function uploadResults (req, res) {
    try {
        var sPath = path.resolve(config.get("bedelos.datapath"));

        var tcHeim = req.swagger.params.tcHeim.originalValue;
        var tcGast = req.swagger.params.tcGast.originalValue;
        var sResult = req.swagger.params.res.originalValue;
        sResult = decodeURI(sResult);
        var oResult = JSON.parse(sResult);
        jsonfile.writeFileSync(sPath + "/ergebnisse/kln001.json", oResult, {spaces: 2});

        var picture = req.swagger.params.picture.originalValue;
        var sFilename = path.resolve(config.get("temp.dir") + "/" + picture.originalname);
        fs.writeFileSync(sFilename, picture.buffer);

        var html = jade.renderFile("api/views/mail.jade", {
            pretty: true,
            res: oResult
        });

        var transporter = nodemailer.createTransport({
            host: 'mail.sap-ag.de',
            secureConnection: false,
            port: "25"
        });

        var aMailTo = [];
        /*aMailTo.push('BDL Online Spielbericht <bdlonlinespielplan@gmail.com>');
        aMailTo.push('Spielleiter BDL <spielleiter@badischedartliga.de>');
        aMailTo.push('BDL@BWDV <bdl@bwdv.de>');
        if (tcHeim!="") {
            aMailTo.push('Teamkapitän Heim <' + tcHeim + '>');
        }
        if (tcGast!="") {
            aMailTo.push('Teamkapitän Gast <' + tcGast + '>');
        }
        
        aMailCC.push('Dominik Boss <odom3003@googlemail.com>');
        aMailCC.push('Jochen Becker <jb@jankovsky.de>');*/
        var aMailCC = [];
        aMailCC.push('Marius Augenstein <Marius.Augenstein@gmail.com>');

        var mailOptions = {
            //from: 'BDL Online Spielbericht <bdlonlinespielplan@gmail.com>',
            from: 'Marius Augenstein <Marius.Augenstein@sap.com>',
            to: aMailTo.join(', '),
            cc: aMailCC.join(', '),

            subject: 'BDL Online Spielberichtsbogen',
            html: html,
            attachments:[
                {   // stream as an attachment
                    filename: 'Spielberichtsfoto.png',
                    content: fs.createReadStream(sFilename)
                }
            ]
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                throw new Error('Failed to send email: '  + error.stack);
            }

            res.status(200).send(html);
        });

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));
    }
}

module.exports = {
    post: uploadResults
};

