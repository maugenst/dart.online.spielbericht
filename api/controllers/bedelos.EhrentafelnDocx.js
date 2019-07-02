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
const pug = require('pug');
const session = require('../helpers/Session');
const zipFolder = require('zip-a-folder');
const _ = require('lodash');

/**
 * Class Description
 */
class EhrentafelnDocx {
    constructor() {}

    static getField(oField) {
        let ret = [];
        if (_.isObject(oField)) {
            for(const key in oField) {
                ret.push(`${key}: ${oField[key]}`);
            }
        } else if (_.isString(oField)) {
            ret.push(oField);
        } else if (_.isInteger(oField)) {
            ret.push(oField);
        }
        return ret.join(', ');
    }

    static async get(req, res) {
        try {
            var oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);

            if (!oSessionData) {
                res.cookie('BDL_SESSION_REDIRECT', req.url);
                res.redirect('/bedelos/login');
                return;
            }

            /*if (oSessionData.username !== config.get('bedelos.adminuser')) {
                res.status(200).send(pug.renderFile('api/views/authorizederror.jade'));
                return;
            }*/

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
                .on('end', async () => {
                    let oTeams = require(sPath + '/Teams.json');
                    let oSpielplan = require(sPath + '/Spielplan.json');
                    let spielplanHelper = new Spielplan(oSpielplan, oTeams);

                    const allStatistics = {};
                    const allTables = {};
                    const oLigen = config.get('bedelos.ligen');
                    aLigen.forEach(async liga => {
                        let sStatisticsFile = path.resolve(sStatisticsPath + '/' + liga + '.json');
                        if (fs.existsSync(sStatisticsFile)) {
                            allStatistics[liga] = ranking.sortStatisticByNames(jsonfile.readFileSync(sStatisticsFile));

                            var sTableFile = path.resolve(sTablesPath + '/' + liga + '.json');
                            allTables[liga] = ranking.sortTableByRank(jsonfile.readFileSync(sTableFile));
                        }
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
                                if (platz.team === team && platz.name.trim().length > 1 && !platz.name.endsWith('(N)')) {
                                    const siege = platz.single['3:0'] + platz.single['3:1'] + platz.single['3:2'] + platz.double['3:0'] + platz.double['3:1'] + platz.double['3:2'];
                                    /*const aSL = [];
                                    for (const sls in platz.sl) {
                                        aSL.push({
                                            sl: sls,
                                            count: platz.sl[sls]
                                        })
                                    }
                                    const aHF = [];
                                    for (const hfs in platz.hf) {
                                        aHF.push({
                                            hf: hfs,
                                            count: platz.hf[hfs]
                                        })
                                    }
                                    const aMax = [];
                                    for (const maxs in platz.max) {
                                        aMax.push({
                                            max: maxs,
                                            count: platz.max[maxs]
                                        })
                                    }*/

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
                    zipFolder.zipFolder(dir, zip, function(err) {
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
