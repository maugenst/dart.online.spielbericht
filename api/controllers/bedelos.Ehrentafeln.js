'use strict';

let util = require('util');
let path = require('path');
let config = require('config');
let os = require('os');
let fs = require('fs');
let _ = require('lodash');
let jsonfile = require('jsonfile');
let ranking = require('../helpers/Ranking.js');
let ligaHelper = require('../helpers/Liga');
let Spielplan = require('../helpers/Spielplan');
let logger = require('../helpers/Logger');
let session = require('../helpers/Session');
let PdfPage = require('../helpers/PdfPage');
let PdfTable = require('../helpers/PdfTable');
let Logo = require('../helpers/BDLLogo');
let BDLLogo = new Logo();
let walker = require('walker');
let content = fs.readFileSync(path.resolve(__dirname, '../../data/docx/ehrentafeln.docx'), 'binary');
let zip = new JSZip(content);
let doc = new Docxtemplater();

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
                    allStatistics[liga] = ranking.sortStatisticByNames(jsonfile.readFileSync(sStatisticsFile));

                    var sTableFile = path.resolve(sTablesPath + '/' + liga + '.json');
                    allTables[liga] = ranking.sortTableByRank(jsonfile.readFileSync(sTableFile));
                });
                let pdfPage = new PdfPage({fontsize: 16});

                Object.keys(oTeams).forEach(team => {
                    //const team = Object.keys(oTeams)[0];
                    const liga = spielplanHelper.getLigaFor(team);
                    if (liga) {
                        let platzierung = 99;
                        allTables[liga].forEach((rank, i) => {
                            if (rank.name === team) {
                                platzierung = i + 1;
                            }
                        });
                        let mainTable = new PdfTable({
                            style: 'table',
                            table: {
                                body: []
                            }
                        });

                        let pdfTable = new PdfTable({
                            style: 'table',
                            pageBreak: 'after',
                            table: {
                                widths: [150, 210],
                                body: []
                            },

                            layout: {
                                hLineColor: function(i, node) {
                                    return i === 0 || i === node.table.body.length ? 'black' : 'white';
                                },
                                vLineColor: function(i, node) {
                                    return i === 0 || i === node.table.widths.length ? 'black' : 'white';
                                },
                                paddingTop: function(i) {
                                    return i === 0 ? 20 : 0;
                                },
                                paddingBottom: function(i) {
                                    return i === 0 ? 20 : 0;
                                },
                                paddingLeft: function(i) {
                                    return i === 0 ? 20 : 0;
                                },
                                paddingRight: function(i, node) {
                                    return i === node.table.widths.length - 1 ? 20 : 0;
                                }
                            }
                            //, layout: 'noBorders'
                        });
                        pdfTable.addRow([
                            {
                                image: BDLLogo.getLarge(),
                                width: 150
                            },
                            {
                                text: [
                                    {text: 'Das Team\n\n', style: ['center']},
                                    {text: `${oTeams[team].name}\n`, style: ['center', 'h1', 'underline', 'blue']}
                                ]
                            }
                        ]);
                        pdfTable.addRow([{text: 'erreichte in der\n', colSpan: 2, style: ['center']}, {}]);
                        pdfTable.addRow([
                            {
                                text: `BDL - ${ligaHelper.getFullLigaName(
                                    liga
                                )}, Saison: 20${saisonPart1}/20${saisonPart2}\n`,
                                colSpan: 2,
                                style: ['center', 'h3']
                            },
                            {}
                        ]);
                        pdfTable.addRow([
                            {text: `den ${platzierung}. Platz.`, colSpan: 2, style: ['center', 'h1', 'underline']},
                            {}
                        ]);
                        pdfTable.addRow([{text: '\nEingesetzte Spieler:', colSpan: 2}, {}]);

                        const playersTable = new PdfTable({
                            table: {
                                headerRows: 2,
                                body: []
                            },
                            layout: 'noBorders'
                        });
                        playersTable.setTableHeader([
                            [
                                {text: 'Name, Vorname', rowSpan: 2, fillColor: 'white'},
                                {text: 'Highlights', colSpan: 4, fillColor: 'white'},
                                {},
                                {},
                                {}
                            ],
                            [
                                {},
                                {text: 'Anzahl\nSiege', noWrap: false, fillColor: 'white'},
                                {text: 'Anzahl\nHigh Scores', noWrap: false, fillColor: 'white'},
                                {text: 'Anzahl\nShort Legs', noWrap: false, fillColor: 'white'},
                                {text: 'Anzahl\nHigh Finishes', noWrap: false, fillColor: 'white'}
                            ]
                        ]);
                        allStatistics[liga].forEach(platz => {
                            if (platz.team === team && platz.name.trim().length > 1 && !platz.name.endsWith('(N)')) {
                                const siege = platz['3:0'] + platz['3:1'] + platz['3:2'];
                                playersTable.addRow([
                                    {text: `${platz.name}`, style: ['cell', 'center', 'small']},
                                    {text: getField(siege), style: ['cell', 'center', 'small']},
                                    {text: getField(platz.max), style: ['cell', 'center', 'small']},
                                    {text: getField(platz.sl), style: ['cell', 'center', 'small']},
                                    {text: getField(platz.hf), style: ['cell', 'center', 'small']}
                                ]);
                            }
                        });

                        pdfTable.addRow([_.extend(playersTable.getContent(), {colSpan: 2}), {}]);

                        pdfPage.addTable(pdfTable.getContent());
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
