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
var pdfmake = require('pdfmake');
var PdfPrinter = require('pdfmake/src/printer');

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

            var fonts = {
                Roboto: {
                    normal: path.resolve(config.get("fonts.dir") + '/Roboto-Regular.ttf'),
                    bold: path.resolve(config.get("fonts.dir") + '/Roboto-Medium.ttf'),
                    italics: path.resolve(config.get("fonts.dir") + '/Roboto-Italic.ttf'),
                    bolditalics: path.resolve(config.get("fonts.dir") + '/Roboto-Italic.ttf')
                }
            };

            var printer = new PdfPrinter(fonts);
            var pdfDoc = printer.createPdfKitDocument(dd);
            res.setHeader('Content-disposition', 'inline; filename="Tabelle.pdf"');
            res.setHeader('Content-type', 'application/pdf');

            pdfDoc.pipe(res);
            pdfDoc.end();

        } else {
            var html = pug.renderFile("api/views/tables.jade", {
                pretty: true,
                ranking: aRanking,
                teams: oTeams,
                username: username,
                liga: ligaHelper.getFullLigaName(liga)
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
