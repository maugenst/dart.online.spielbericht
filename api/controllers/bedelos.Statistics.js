'use strict';

const {promisify} = require('util');
const path = require('path');
const config = require('config');
const os = require('os');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const _ = require('lodash');
const pug = require('pug');
const jsonfile = require('jsonfile');
const ranking = require('../helpers/Ranking.js');
const ligaHelper = require('../helpers/Liga');
const logger = require('../helpers/Logger');
const session = require('../helpers/Session');

function getField(oField) {
    if (oField !== 0) {
        return '' + oField;
    } else {
        return '';
    }
}

async function getSeasons(path) {
    const aDirContent = await readdir(path);
    return aDirContent.filter(entry => entry.length === 4 && _.toInteger(entry) !== 0);
}

async function get(req, res) {
    try {
        var username = session.getUsername(req.cookies.BDL_SESSION_TOKEN);

        var sPath = path.resolve(config.get('bedelos.datapath'));
        const saison = req.swagger.params.saison.raw || config.get('bedelos.saison');

        const allSeasons = await getSeasons(path.dirname(sPath));

        if (req.swagger.params.saison.raw) {
            sPath = path.dirname(sPath);
            sPath = path.resolve(sPath, saison);
        }

        var sStatisticsPath = path.resolve(sPath + '/statistiken/');
        var oTeams = require(sPath + '/Teams.json');
        var liga = req.swagger.params.liga.raw;
        var sStatisticsFile = path.resolve(sStatisticsPath + '/' + liga + '.json');
        var aRanking = ranking.sortStatisticByScores(jsonfile.readFileSync(sStatisticsFile));

        var html = '';
        if (_.toInteger(saison) < 1819) {
            html = pug.renderFile('api/views/statistic.jade', {
                pretty: true,
                ranking: aRanking,
                teams: oTeams,
                username: username,
                allSeasons: allSeasons,
                liga: ligaHelper.getFullLigaName(liga),
                ligaShort: liga
            });
        } else {
            html = pug.renderFile('api/views/statisticNEW.jade', {
                pretty: true,
                ranking: aRanking,
                teams: oTeams,
                username: username,
                allSeasons: allSeasons,
                liga: ligaHelper.getFullLigaName(liga),
                ligaShort: liga
            });
        }

        res.status(200).send(html);
    } catch (error) {
        res.status(500).send('Error: ' + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: get
};
