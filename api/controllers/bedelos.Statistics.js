'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var pug = require('pug');
var jsonfile = require('jsonfile');
var ranking = require('../helpers/Ranking.js');
var ligaHelper = require('../helpers/Liga');
var logger = require('../helpers/Logger');
var session = require('../helpers/Session');
var PdfPage = require('../helpers/PdfPage');
var PdfTable = require('../helpers/PdfTable');

function getField(oField) {
    if(oField!==0) {
        return ""+oField;
    } else {
        return "";
    }
}

function getTable (req, res) {
    try {
        var username = session.getUsername(req.cookies.BDL_SESSION_TOKEN);
        
        var sPath = path.resolve(config.get("bedelos.datapath"));
        var sStatisticsPath = path.resolve(config.get("bedelos.datapath") + '/statistiken/');
        var oTeams = require(sPath + '/Teams.json');
        var liga = req.swagger.params.liga.raw;
        var sStatisticsFile = path.resolve(sStatisticsPath + '/' + liga + '.json');
        var aRanking = ranking.sortStatisticByScores(jsonfile.readFileSync(sStatisticsFile));

        if (req.swagger.params.pdf && req.swagger.params.pdf.raw === "true") {
            var pdfPage = new PdfPage();
            pdfPage.addHeadline("Statistiken " + ligaHelper.getFullLigaName(liga));

            var pdfTable = new PdfTable();
            pdfTable.setTableHeader(["Pl.","Spieler","Verein","3:0\n5","3:1\n4","3:2\n3","2:3\n2","1:3\n1","0:3\n0","HF\n1","SL\n1","Max\n1","Pkt"]);
            for(var i in aRanking) {
                var player = aRanking[i];
                var iRank = parseInt(i)+1;
                pdfTable.addRow([iRank + ".",
                    player.name,
                    oTeams[player.team].name,
                    {text: getField(player['3:0']), style:['cell','center']},
                    {text: getField(player['3:1']), style:['cell','center']},
                    {text: getField(player['3:2']), style:['cell','center']},
                    {text: getField(player['2:3']), style:['cell','center']},
                    {text: getField(player['1:3']), style:['cell','center']},
                    {text: getField(player['0:3']), style:['cell','center']},
                    {text: getField(player.hf), style:['cell','center']},
                    {text: getField(player.sl), style:['cell','center']},
                    {text: getField(player.max), style:['cell','center']},
                    {text: ""+player.punkte, style:['cell','center']}
                ]);
            }

            pdfPage.addTable(pdfTable.getContent());

            res.setHeader('Content-disposition', 'inline; filename="Tabelle.pdf"');
            res.setHeader('Content-type', 'application/pdf');

            var pdfDoc = pdfPage.generateDocument();
            pdfDoc.pipe(res);
            pdfDoc.end();

        } else {
            var html = pug.renderFile("api/views/statistic.jade", {
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
