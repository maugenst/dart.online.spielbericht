'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var pug = require('pug');
var jsonfile = require('jsonfile');
var moment = require('moment');
var ranking = require('../helpers/Ranking.js');
var ligaHelper = require('../helpers/Liga');
var logger = require('../helpers/Logger');
var session = require('../helpers/Session');
var PdfPage = require('../helpers/PdfPage');
var PdfTable = require('../helpers/PdfTable');
var Spielplan = require('../helpers/Spielplan');

function getField(oField) {
    if(oField!==0) {
        return ""+oField;
    } else {
        return "";
    }
}

function getTable (req, res) {
    try {
        var oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);

        if (!oSessionData) {
            res.cookie('BDL_SESSION_REDIRECT', req.url);
            res.redirect("/bedelos/login");
            return;
        }

        if (oSessionData.username === config.get("bedelos.adminuser")) {
            res.status(200).send(pug.renderFile("api/views/authorizederror.jade"));
            return;
        }
        var sPath = path.resolve(config.get("bedelos.datapath"));
        var oTeams = require(sPath + '/Teams.json');
        var oSpielplan = require(path.resolve(sPath,'Spielplan.json'));
        var spielplanHelper = new Spielplan(oSpielplan, oTeams);
        let liga = ligaHelper.getFullLigaName(spielplanHelper.getLigaFor(oSessionData.username));

        let date = moment().format('DD.MM.YYYY');

        var pdfPage = new PdfPage();

        pdfPage.add({
                        style: 'table',
                        table: {
                            widths: ['*', 120],
                            body: [
                                [{ text: `Teammeldung für Team\n"${oTeams[oSessionData.username].name}"`, style: 'h1' },
                                 {
                                    image: path.resolve(config.get("static.dir") + '/spielbericht/app/images/BDLLogo.png'),
                                    width: 120,
                                    height: 80
                                 }]
                            ]
                        },
                        layout: 'headerLineOnly'
                    });


        pdfPage.add({text: `EMAIL an spielleiter@badischedartliga.de`, style: 'h3'});
        pdfPage.add({text: `${date}`, style: 'text', alignment: 'right'});
        pdfPage.add({text: '\n\nHiermit melden wir für die kommende Saison folgendes Team:\n\n\n    ', style: 'text'});
        pdfPage.add({
                        style: 'table',
                        table: {
                            widths: [150, '*', '*'],
                            body: [
                                    [
                                        { text: ' ', style: 'tableHeader', alignment: 'center', noWrap: true},
                                        { text: 'Aktuell', style: 'tableHeader', alignment: 'center', noWrap: true},
                                        { text: 'Änderungen', style: 'tableHeader', alignment: 'center', noWrap: true}],
                                    [{text:'\nVerein:', style: 'bold'},
                                        {text:'\n', style: 'text'},
                                        {text:'\n_____________________________________', style: 'text'}],
                                    [{text:'\nTeam (ID):', style: 'bold'},
                                        {text:`\n${oTeams[oSessionData.username].name} (${oSessionData.username})`, style: 'text'},
                                        {text:'\n_____________________________________', style: 'text'}],
                                    [{text:'\nLiga (bisher):', style: 'bold'},
                                        {text:`\n${liga}`, style: 'text'},
                                        {text:'\n_____________________________________', style: 'text'}],
                                    [{text:'\nKapitän:', style: 'bold'}, {
                                        text:`\n${oTeams[oSessionData.username].teamvertreter.name}\n${oTeams[oSessionData.username].teamvertreter.mail}\n${oTeams[oSessionData.username].teamvertreter.tel}`,
                                        style: 'text'
                                    },
                                        {text:'\n_____________________________________\n\n_____________________________________\n\n_____________________________________', style: 'text'}],
                                    [{text:'\nSpielstädte:', style: 'bold'}, {
                                        text:`\n${oTeams[oSessionData.username].spiellokal.name}\n${oTeams[oSessionData.username].spiellokal.strasse}\n${oTeams[oSessionData.username].spiellokal.ort}`,
                                        style: 'text'
                                    },
                                        {text:'\n_____________________________________\n\n_____________________________________\n\n_____________________________________', style: 'text'}]
                            ],
                        },
                        layout: 'noBorders'
                    });

        pdfPage.add({text: `\n\n\nSportliche Grüße,\n\n\ngez. ${oTeams[oSessionData.username].teamvertreter.name}`, style: 'text'});



        res.setHeader('Content-disposition', 'inline; filename="TeamMeldung.pdf"');
        res.setHeader('Content-type', 'application/pdf');

        var pdfDoc = pdfPage.generateDocument();
        pdfDoc.pipe(res);
        pdfDoc.end();

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: getTable
};
