'use strict';

const path = require('path');
const config = require('config');
const EhrentafelDocx = require('../helpers/EhrentafelDocx');

const jsonfile = require('jsonfile');
const fs = require('fs');
const ranking = require('../helpers/Ranking.js');
const ligaHelper = require('../helpers/Liga');
const Spielplan = require('../helpers/Spielplan');
const logger = require('../helpers/Logger');
const walker = require('walker');
const zipFolder = require('zip-folder');

/**
 * Class Description
 */
class EhrentafelnDocx {
    constructor() {}

    static getField(oField) {
        if (oField !== 0) {
            return '' + oField;
        } else {
            return '';
        }
    }

    static get(req, res) {
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

                    const ehrentafel = new EhrentafelDocx();

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
                            const aPlayersTable = [];
                            allStatistics[liga].forEach(platz => {
                                if (
                                    platz.team === team &&
                                    platz.name.trim().length > 1 &&
                                    !platz.name.endsWith('(N)')
                                ) {
                                    const siege = platz['3:0'] + platz['3:1'] + platz['3:2'];
                                    aPlayersTable.push({
                                        name: platz.name,
                                        siege: EhrentafelnDocx.getField(siege),
                                        max: EhrentafelnDocx.getField(platz.max),
                                        sl: EhrentafelnDocx.getField(platz.sl),
                                        hf: EhrentafelnDocx.getField(platz.hf)
                                    });
                                }
                            });
                            const ehrentafel = new EhrentafelDocx({
                                Teamname: oTeams[team].name,
                                Liga: ligaHelper.getFullLigaName(liga),
                                Saison1: saisonPart1,
                                Saison2: saisonPart2,
                                TeamID: team,
                                Platz: platzierung,
                                spieler: aPlayersTable
                            });

                            ehrentafel.generate();
                        }
                    });
                    const dir = path.resolve(`${__dirname}../../../data/docx/${saisonPart1}${saisonPart2}`);
                    const zip = path.resolve(`${__dirname}../../../data/docx/Ehrentafeln.zip`);
                    zipFolder(dir, zip, function(err) {
                        if (err) {
                            res.status(500).send(err);
                        } else {
                            res.download(zip, path.basename(zip), function(err) {
                                if (err) {
                                    res.status(500).send(err);
                                }
                            });
                        }
                    });
                });
        } catch (error) {
            res.status(500).send('Error: ' + error.stack.replace('/\n/g', '<br>'));

            logger.log.debug(error.stack);
        }
    }
}

module.exports = EhrentafelnDocx;
