'use strict';

let util = require('util');
let path = require('path');
let config = require('config');
let os = require('os');
let fs = require('fs');
let pug = require('pug');
let jsonfile = require('jsonfile');
let ranking = require('../helpers/Ranking.js');
let ligaHelper = require('../helpers/Liga');
let Spielplan = require('../helpers/Spielplan');
let logger = require('../helpers/Logger');
let session = require('../helpers/Session');
let PdfPage = require('../helpers/PdfPage');
let PdfTable = require('../helpers/PdfTable');
let walker = require('walker');

function getField(oField) {
    if (oField !== 0) {
        return '' + oField;
    } else {
        return '';
    }
}

function generateDocuments(req, res) {
    try {
        let sPath = path.resolve(config.get('bedelos.datapath'));
        const saison = req.swagger.params.saison.raw || config.get('bedelos.saison');
        const saisonPart1 = saison.substring(0, 2);
        const saisonPart2 = saison.substring(2, 4);


        if (req.swagger.params.saison.raw) {
            sPath = path.dirname(sPath);
            sPath = path.resolve(sPath, saison);
        }

        let oTeams = require(sPath + '/Teams.json');
        let oSpielplan = require(sPath + '/Spielplan.json');
        let spielplanHelper = new Spielplan(oSpielplan, oTeams);

        const allRankings = {};
        const aLigen = [];

        let sStatisticsPath = path.resolve(sPath + '/statistiken/');
        let sTablesPath = path.resolve(sPath + '/tabellen/');

        walker(sStatisticsPath)
            .on('file', entry => {
                const liga = ligaHelper.calcLigaFromFilename(entry);
                aLigen.push(liga);
            })
            .on('end', () => {
                let oTeams = require(sPath + '/Teams.json');
                let oSpielplan = require(sPath + '/Spielplan.json');
                let spielplanHelper = new Spielplan(oSpielplan, oTeams);

                const allStatistics = {};
                const allTables = {};
                const oLigen = config.get('bedelos.ligen');
                aLigen.forEach(liga => {
                    let sStatisticsFile = path.resolve(sStatisticsPath + '/' + liga + '.json');
                    allStatistics[liga] = ranking.sortStatisticByScores(jsonfile.readFileSync(sStatisticsFile));

                    var sTableFile = path.resolve(sTablesPath + '/' + liga + '.json');
                    allTables[liga] = ranking.sortTableByRank(jsonfile.readFileSync(sTableFile));
                });
                let pdfPage = new PdfPage({fontsize: 16});

                Object.keys(oTeams).forEach(team => {
                    const liga = spielplanHelper.getLigaFor(team);
                    if (liga) {
                        //console.log(`${oTeams[team].name} -> ${liga}`);
                        let platzierung = 99;
                        allTables[liga].forEach((rank, i) => {
                            if (rank.name === team) {
                                platzierung = i+1;
                            }
                        });
                        pdfPage.add({text: 'Das Team\n', style: ['center']});
                        pdfPage.add({text: `${oTeams[team].name}\n`, style: ['center', 'h1', 'underline', 'blue']});
                        pdfPage.add({text: 'erreichte in der\n', style: ['center']});
                        pdfPage.add({text: `BDL - ${ligaHelper.getFullLigaName(liga)}\n`, style: ['center', 'h3']});
                        pdfPage.add({text: `Saison: 20${saisonPart1}/20${saisonPart2}\n`, style: ['center', 'h3']});
                        pdfPage.add({text: 'den \n', style: ['center']});
                        pdfPage.add({text: `${platzierung}. Platz.`, style: ['center', 'h1', 'underline']});
                        pdfPage.add({text: '\n\nEingesetzte Spieler:'});

                        let pdfTable = new PdfTable({
                            style: 'table',
                            table: {
                                headerRows: 2,
                                body: []
                            }
                        });
                        pdfTable.setTableHeader([
                            [
                                {text: 'Name, Vorname', rowSpan: 2, fillColor: 'lightgrey'},
                                {text: 'Highlights', colSpan: 4, fillColor: 'lightgrey'},
                                {},
                                {},
                                {}
                            ],
                            [
                                {},
                                {text: 'Anzahl\nSiege', noWrap: false, fillColor: 'lightgrey'},
                                {text: 'Anzahl\nHigh Scores', noWrap: false, fillColor: 'lightgrey'},
                                {text: 'Anzahl\nShort Legs', noWrap: false, fillColor: 'lightgrey'},
                                {text: 'Anzahl\nHigh Finishes', noWrap: false, fillColor: 'lightgrey'}
                            ]
                        ]);
                        allStatistics[liga].forEach(platz => {
                            if (platz.team === team && platz.name.trim().length > 1 && !platz.name.endsWith('(N)')) {
                                const siege = platz['3:0'] +platz['3:1'] + platz['3:2'];
                                pdfTable.addRow([
                                    `${platz.name}`,
                                    {text: getField(siege), style: ['cell', 'center']},
                                    {text: getField(platz.max), style: ['cell', 'center']},
                                    {text: getField(platz.sl), style: ['cell', 'center']},
                                    {text: getField(platz.hf), style: ['cell', 'center']}
                                ]);

                            }
                        });

                        pdfPage.addTable(pdfTable.getContent());
                        pdfPage.add({text: '', pageBreak:'after'});
                    }
                });

                res.setHeader('Content-disposition', 'inline; filename="Tabelle.pdf"');
                res.setHeader('Content-type', 'application/pdf');

                let pdfDoc = pdfPage.generateDocument();
                pdfDoc.pipe(res);
                pdfDoc.end();
            });
    } catch (error) {
        res.status(500).send('Error: ' + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: generateDocuments
};
