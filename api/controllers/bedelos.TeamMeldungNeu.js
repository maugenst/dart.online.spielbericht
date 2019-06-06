'use strict';

var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var qs = require('querystring');
var pug = require('pug');
var nodemailer = require("nodemailer");
var logger = require('../helpers/Logger');
var session = require('../helpers/Session');
var Spielplan = require('../helpers/Spielplan');

var sPath = path.resolve(config.get("bedelos.datapath"));
var oTeams = require(sPath + '/Teams.json');
var oVereine = require(sPath + '/Vereine.json');

function get(req, res) {

  try {
    var oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);
    let teamId = '';
    let team = {
      name: '',
      spiellokal: {
        name: '',
        strasse: '',
        ort: '',
        nichtraucher: true
      },
      teamvertreter: {
        name: '',
        mail: ''
      }
    };
    let verein = {
      name: ''
    };


    if (oSessionData) {
      teamId = oSessionData.username;
      team = oTeams[teamId];
      verein = oVereine[team.verein];
    }

    var html = pug.renderFile("api/views/teammeldungNeu.pug", {
      pretty: true,
      verein: verein,
      team: team
    });

    res.status(200).send(html);

  } catch (error) {
    res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

    logger.log.debug(error.stack);
  }


}

function post(req, res) {

  try {
    var body = pug.renderFile("api/views/teammeldungNeuBody.pug", {
      pretty: true,
      data: req.body
    });

    var mail = pug.renderFile("api/views/teammeldungNeuMail.pug", {
      pretty: true,
      data: req.body
    });

    var transporter = nodemailer.createTransport({
      sendmail: true,
      newline: 'unix',
      path: '/usr/sbin/sendmail'
    });
    var aMailTo = [];
    var aMailCC = [];

    aMailTo.push('Spielleiter BDL <spielleiter@badischedartliga.de>');
    aMailTo.push('Praesident BDL <praesident@badischedartliga.de>');
    aMailTo.push('Vizepraesident BDL <vizepraesident@badischedartliga.de>');
    aMailTo.push('Schriftfuehrer BDL <schriftfuehrer@badischedartliga.de>');

    aMailCC.push(`Teamkapitän <${req.body.TeamkapitaenEmail}>`);

      var mailOptions = {
        from: 'BDL Online Team Meldung <teammeldung@badischedartliga.de>',
        to: '\'' + aMailTo.join(', ') + '\'',
        cc: '\'' + aMailCC.join(', ') + '\'',

        subject: 'BDL Online Team Meldung',
        html: mail
      };


    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        throw new Error('Failed to send email: '  + error.stack);
      }
      res.status(200).send(body);
    });

  } catch (error) {
    res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

    logger.log.debug(error.stack);
  }


}

module.exports = {
    get: get,
    post: post
};
