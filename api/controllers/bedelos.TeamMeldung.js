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

function ask(req, res) {
    var sPath = path.resolve(config.get("bedelos.datapath"));
    var oTeams = jsonfile.readFileSync(sPath + '/Teams.json');

    // aTeams is just needed for typeahead fields in form
    var aTeams = [];
    for(var team in oTeams) {
        aTeams.push({
            id: team,
            name: oTeams[team].name + " - " + team
        });
    }

    var html = pug.renderFile("api/views/teamMeldungSelection.jade", {
        pretty: true,
        sTeams: JSON.stringify(aTeams)
    });

    res.status(200).send(html);
}

function generatePDF (req, res) {
    try {
        /*var oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);

        if (!oSessionData) {
            res.cookie('BDL_SESSION_REDIRECT', req.url);
            res.redirect("/bedelos/login");
            return;
        }

        if (oSessionData.username === config.get("bedelos.adminuser")) {
            res.status(200).send(pug.renderFile("api/views/authorizederror.jade"));
            return;
        }*/
        var sPath = path.resolve(config.get("bedelos.datapath"));
        var oTeams = require(sPath + '/Teams.json');
        var oSpielplan = require(path.resolve(sPath,'Spielplan.json'));
        var spielplanHelper = new Spielplan(oSpielplan, oTeams);

        let teamId = (req.swagger.params.teamId) ? (req.swagger.params.teamId.raw) : '';
        let team = (teamId !== '') ? oTeams[teamId] : {
                name: '',
                teamvertreter: {
                    name: '',
                    mail: '',
                    tel: ''
                },
                spiellokal: {
                    name: '',
                    strasse: '',
                    ort: ''
                }
            };
        let liga = ligaHelper.getFullLigaName(spielplanHelper.getLigaFor(teamId));

        let date = moment().format('DD.MM.YYYY');

        var pdfPage = new PdfPage();

        pdfPage.add({
                        style: 'table',
                        table: {
                            widths: ['*', 120],
                            body: [
                                [(teamId !== '') ? { text: `Teammeldung für Team\n"${team.name}"`, style: 'h1' } : { text: `Meldung für neues Team\n`, style: 'h1' },
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
        let oFormular = (teamId === '')
            ? {
                style: 'table',
                table: {
                    widths: [150, 100, '*'],
                    body: [
                        [
                            { text: ' ', style: 'tableHeader', alignment: 'center', noWrap: true},
                            { text: ' ', style: 'tableHeader', alignment: 'center', noWrap: true},
                            { text: 'Neumeldung', style: 'tableHeader', alignment: 'center', noWrap: true}],
                        [{text:'\nVerein:', style: 'bold'},
                            {text:'\n', style: 'text'},
                            {text:'\n___________________________________________________', style: 'text'}],
                        [{text:'\nTeamname:', style: 'bold'},
                            {text:'\n', style: 'text'},
                            {text:'\n___________________________________________________', style: 'text'}],
                        [{text:'\nKapitän:', style: 'bold'},
                            {text:'\nName: \n\nEMail: \n\nTel: ', style: 'text'},
                            {text:'\n___________________________________________________\n\n___________________________________________________\n\n___________________________________________________', style: 'text'}],
                        [{text:'\nSpielstädte:', style: 'bold'},
                            {text:'\nName: \n\nStr.: \n\nPlz. & Ort: ', style: 'text'},
                            {text:'\n___________________________________________________\n\n___________________________________________________\n\n___________________________________________________', style: 'text'}]
                    ],
                },
                layout: 'noBorders'
            } : {
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
                            {text:`\n${team.name} (${teamId})`, style: 'text'},
                            {text:'\n_____________________________________', style: 'text'}],
                        [{text:'\nLiga (bisher):', style: 'bold'},
                            {text:`\n${liga}`, style: 'text'},
                            {text:'\n_____________________________________', style: 'text'}],
                        [{text:'\nKapitän:', style: 'bold'}, {
                            text:`\n${team.teamvertreter.name}\n${team.teamvertreter.mail}\n${team.teamvertreter.tel}`,
                            style: 'text'
                        },
                            {text:'\n_____________________________________\n\n_____________________________________\n\n_____________________________________', style: 'text'}],
                        [{text:'\nSpielstädte:', style: 'bold'}, {
                            text:`\n${team.spiellokal.name}\n${team.spiellokal.strasse}\n${team.spiellokal.ort}`,
                            style: 'text'
                        },
                            {text:'\n_____________________________________\n\n_____________________________________\n\n_____________________________________', style: 'text'}]
                    ],
                },
                layout: 'noBorders'
            };

        pdfPage.add(oFormular);

        pdfPage.add({text: `\n\n\nSportliche Grüße,\n\n\ngez. ${team.teamvertreter.name}`, style: 'text'});



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
    get: ask,
    post: generatePDF
};
