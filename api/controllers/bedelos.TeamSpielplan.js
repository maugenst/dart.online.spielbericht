'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var pug = require('pug');
var jsonfile = require('jsonfile');
var walker = require('walker');
var _ = require('lodash');
var logger = require('../helpers/Logger');
var session = require('../helpers/Session');
var Spielplan = require('../helpers/Spielplan');
var moment = require('moment');
var PdfPage = require('../helpers/PdfPage');
var PdfTable = require('../helpers/PdfTable');


function sortBySpieltag(a, b) {
    var t1 = parseInt(a.spieltag.split('_')[1]);
    var t2 = parseInt(b.spieltag.split('_')[1]);
    if ( t1 < t2 ) {
        return -1;
    } else if (t1 === t2) {
        return 0;
    } else {
        return 1;
    }
}

function getTeamSpielplan (req, res) {
    try {
        var teamId = req.swagger.params.teamId.raw;

        var sPath = path.resolve(config.get("bedelos.datapath"));
        if (req.swagger.params.saison.raw) {
            sPath = path.dirname(sPath);
            sPath = path.resolve(sPath, req.swagger.params.saison.raw);
        }
        var oSpielplan = require(path.resolve(sPath,'Spielplan.json'));
        var oTeams = require(path.resolve(sPath, 'Teams.json'));

        var spielplanHelper = new Spielplan(oSpielplan, oTeams);
        var aSpiele = spielplanHelper.getFilteredGamesMap({heim: teamId});
        var bSpiele = spielplanHelper.getFilteredGamesMap({gast: teamId});
        var alleSpiele = aSpiele.concat(bSpiele);
        alleSpiele.sort(sortBySpieltag);

        var alleGegner = {};

        for (var i = 0; i<alleSpiele.length; i++) {
            var sFilename = path.resolve(sPath + "/ergebnisse/" + alleSpiele[i].id + ".json");
            if (fs.existsSync(sFilename)) {
                var oResult = jsonfile.readFileSync(sFilename);
                alleSpiele[i]['summary'] = oResult.summary;
            }
        }

        if (req.swagger.params.pdf && req.swagger.params.pdf.raw === "true") {
            var pdfPage = new PdfPage();
            pdfPage.addHeadlineH1("Übersicht-Spielplan für " + oTeams[teamId].name + " (Spielbeginn jeweils 20.00 Uhr)");

            var pdfTable = new PdfTable();
            pdfTable.setTableHeader(["Spieltag", "Datum", "Heim", "Ergebnis", "Gast"]);
            for(var i in alleSpiele) {
                var iRank = parseInt(i)+1;
                var sErgebnis = (alleSpiele[i].summary) ? alleSpiele[i].summary.heim.sets + ":" + alleSpiele[i].summary.gast.sets : "-:-";
                pdfTable.addRow([iRank + ".",
                    alleSpiele[i].datum,
                    oTeams[alleSpiele[i].heim].name,
                    {text: sErgebnis, style:['cell','center']},
                    oTeams[alleSpiele[i].gast].name
                ]);
            }
            pdfPage.addTable(pdfTable.getContent());

            pdfPage.addHeadlineH1("Gegner Adressen & Ansprechpartner");

            for (var i in aSpiele) {
                pdfPage.addHeadlineH3(oTeams[aSpiele[i].gast].name);
                var pdfTable = new PdfTable();
                pdfTable.setTableHeader(["Spiellokal", "Teamvertreter + Captain"]);
                pdfTable.addRow([oTeams[aSpiele[i].gast].spiellokal.name + "\n" + oTeams[aSpiele[i].gast].spiellokal.strasse + "\n" + oTeams[aSpiele[i].gast].spiellokal.ort,
                    oTeams[aSpiele[i].gast].teamvertreter.name + "\n" + oTeams[aSpiele[i].gast].teamvertreter.tel + "\n" + oTeams[aSpiele[i].gast].teamvertreter.mail
                ]);
                pdfPage.addTable(pdfTable.getContent());
            }
            res.setHeader('Content-disposition', 'inline; filename="Tabelle.pdf"');
            res.setHeader('Content-type', 'application/pdf');

            var pdfDoc = pdfPage.generateDocument();
            pdfDoc.pipe(res);
            pdfDoc.end();
        } else {
            var html = pug.renderFile("api/views/teamspielplan.jade", {
                pretty: true,
                alleSpiele: alleSpiele,
                username: teamId,
                teams: oTeams
            });

            res.status(200).send(html);
        }
    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: getTeamSpielplan,
    post: getTeamSpielplan
};
