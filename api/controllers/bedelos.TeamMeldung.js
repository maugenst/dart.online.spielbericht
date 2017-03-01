'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var _ = require('lodash');
var fs = require('fs');
var pug = require('pug');
var jsonfile = require('jsonfile');
var moment = require('moment');
var ranking = require('../helpers/Ranking.js');
var ligaHelper = require('../helpers/Liga');
var Vereine = require('../helpers/Vereine');
var logger = require('../helpers/Logger');
var session = require('../helpers/Session');
var PdfPage = require('../helpers/PdfPage');
var PdfTable = require('../helpers/PdfTable');
var Spielplan = require('../helpers/Spielplan');

var sPath = path.resolve(config.get("bedelos.datapath"));
var oTeams = require(sPath + '/Teams.json');
var oVereine = require(sPath + '/Vereine.json');
var oSpielplan = require(path.resolve(sPath,'Spielplan.json'));


function ask(req, res) {
    var sPath = path.resolve(config.get("bedelos.datapath"));
    var oTeams = require(sPath + '/Teams.json');
    var oVereine = require(sPath + '/Vereine.json');

    // aTeams is just needed for typeahead fields in form
    var aTeams = _.flatMap(oTeams, (team, teamID) => {
        return {
            id: teamID,
            name: `Team: ${team.name} (${teamID})`
        };
    }).concat(_.flatMap(oVereine, (verein, vereinsID) => {
        return {
            id: vereinsID,
            name: `Verein: ${verein.name } (${vereinsID})`
        };
    }));

    var html = pug.renderFile("api/views/teamMeldungSelection.jade", {
        pretty: true,
        sTeams: JSON.stringify(aTeams)
    });

    res.status(200).send(html);
}

function generatePDF (req, res) {
    try {
        var pdfPage = new PdfPage();

        let id = (req.swagger.params.id) ? (req.swagger.params.id.raw) : '';

        let aTeams = Vereine.getTeamIDsFor(id);

        aTeams.forEach((teamId, pageCount) => {
            _addContentTo(pdfPage, teamId, (pageCount > 0));
        });

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

function _addContentTo(pdfPage, teamId, bPageBreak) {
    let spielplanHelper = new Spielplan(oSpielplan, oTeams);
    let team = (teamId !== '') ? oTeams[teamId] : {
            name: '',
            verein: '',
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
    let verein  = (teamId !== '') ? oVereine[oTeams[teamId].verein] : {
            name: '',
            kontakt: {
                name: '',
                strasse: '',
                ort: ''
            }
        };
    let liga = ligaHelper.getFullLigaName(spielplanHelper.getLigaFor(teamId));

    let date = moment().format('DD.MM.YYYY');

    let headline = {
        style: 'table',
        table: {
            widths: ['*', 120],
            body: [
                [{
                    text: (teamId !== '') ? `Teammeldung für Team\n"${team.name}"` : `Meldung für neues Team\n`,
                    style: 'h1'
                },
                    {
                        image: path.resolve(config.get("static.dir") + '/spielbericht/app/images/BDLLogo.png'),
                        width: 120,
                        height: 80
                    }]
            ]
        },
        layout: 'headerLineOnly'
    };
    if (bPageBreak) {
        headline.pageBreak = 'before'
    }

    pdfPage.add(headline);


    pdfPage.add({text: `EMAIL an spielleiter@badischedartliga.de`, style: 'h3'});
    pdfPage.add({text: `${date}`, style: 'text', alignment: 'right'});

    pdfPage.add({text:`${verein.name}\n${verein.kontakt.name}\n${verein.kontakt.strasse}\n${verein.kontakt.ort}`,style: 'text'});

    pdfPage.add({text: '\n\nHiermit melden wir für die kommende Saison folgendes Team:\n    ', style: 'text'});
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
                        {text:'\nName: \n\nVorstand: \n\nStr.: \n\nPlz. & Ort: ', style: 'text'},
                        {text:'\n___________________________________________________\n\n___________________________________________________\n\n___________________________________________________\n\n___________________________________________________', style: 'text'}],
                    [{text:'\nTeam:', style: 'bold'},
                        {text:'\nName: ', style: 'text'},
                        {text:'\n___________________________________________________', style: 'text'}],
                    [{text:'\nKapitän:', style: 'bold'},
                        {text:'\nName: \n\nE-Mail: \n\nTel: ', style: 'text'},
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
                        { text: 'Änderungen?', style: 'tableHeader', alignment: 'center', noWrap: true}],
                    [{text:'\nTeamname (ID):', style: 'bold'},
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
}

module.exports = {
    get: ask,
    post: generatePDF
};
