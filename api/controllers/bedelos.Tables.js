'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var pug = require('pug');
var jsonfile = require('jsonfile');
var ranking = require('../helpers/Ranking');
var ligaHelper = require('../helpers/Liga');
var logger = require('../helpers/Logger');
var session = require('../helpers/Session');
var PdfPage = require('../helpers/PdfPage');
var PdfTable = require('../helpers/PdfTable');

function getTable (req, res) {
    try {
        var username = session.getUsername(req.cookies.BDL_SESSION_TOKEN);

        var sPath = path.resolve(config.get("bedelos.datapath"));
        var sTablesPath = path.resolve(config.get("bedelos.datapath") + '/tabellen/');
        var oTeams = require(sPath + '/Teams.json');
        var liga = req.swagger.params.liga.raw;
        var sTableFile = path.resolve(sTablesPath + '/' + liga + '.json');
        var oTabelle = jsonfile.readFileSync(sTableFile);

        var aRanking = ranking.sortTableByRank(oTabelle);

        if (req.swagger.params.pdf && req.swagger.params.pdf.raw === "true") {

            var pdfPage = new PdfPage();
            pdfPage.addHeadlineH1("Tabelle " + ligaHelper.getFullLigaName(liga));

            var pdfTable = new PdfTable();
            pdfTable.setTableHeader(["Platz","Team","Spiele","G","U","V","Sets","Punkte"]);
            for(var i in aRanking) {
                var team = aRanking[i];
                var iRank = parseInt(i)+1;
                pdfTable.addRow([iRank + ".",
                    oTeams[aRanking[i].name].name,
                    {text: ""+team.spiele, style:['cell','center']},
                    {text: ""+team.gewonnen, style:['cell','center']},
                    {text: ""+team.unentschieden, style:['cell','center']},
                    {text: ""+team.verloren, style:['cell','center']},
                    {text: ""+team.sets.own + ":" + team.sets.other, style:['cell','center']},
                    {text: ""+team.punkte.own + ":" + team.punkte.other, style:['cell','center']}
                ]);
            }
            pdfPage.addTable(pdfTable.getContent());

            res.setHeader('Content-disposition', 'inline; filename="Tabelle.pdf"');
            res.setHeader('Content-type', 'application/pdf');

            var pdfDoc = pdfPage.generateDocument();
            pdfDoc.pipe(res);
            pdfDoc.end();
        } else {
            var html = pug.renderFile("api/views/tables.jade", {
                pretty: true,
                ranking: aRanking,
                teams: oTeams,
                username: username,
                liga: ligaHelper.getFullLigaName(liga),
                ligaShort: liga
            });

            res.status(200).send(html);
        }

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: getTable
};
