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
const ranking = require('../helpers/Ranking');
const ligaHelper = require('../helpers/Liga');
const logger = require('../helpers/Logger');
const session = require('../helpers/Session');

async function getSeasons(path) {
    const aDirContent = await readdir(path);
    return aDirContent.filter(entry => entry.length === 4 && _.toInteger(entry) !== 0);
}

async function get(req, res) {
    try {
        var username = session.getUsername(req.cookies.BDL_SESSION_TOKEN);

        var sPath = path.resolve(config.get('bedelos.datapath'));
        const allSeasons = await getSeasons(path.dirname(sPath));
        const saison = req.swagger.params.saison.raw || config.get('bedelos.saison');

        if (req.swagger.params.saison.raw) {
            sPath = path.dirname(sPath);
            sPath = path.resolve(sPath, saison);
        }

        var sTablesPath = path.resolve(`${sPath}/tabellen/`);

        var oTeams = require(sPath + '/Teams.json');
        var liga = req.swagger.params.liga.raw;
        var sTableFile = path.resolve(sTablesPath + '/' + liga + '.json');
        var oTable = jsonfile.readFileSync(sTableFile);

        var aRanking = ranking.sortTableByRank(oTable);

        var html = pug.renderFile('api/views/tables.jade', {
            pretty: true,
            ranking: aRanking,
            teams: oTeams,
            username: username,
            allSeasons: allSeasons,
            liga: ligaHelper.getFullLigaName(liga),
            ligaShort: liga
        });

        res.status(200).send(html);
    } catch (error) {
        res.status(500).send('Error: ' + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: get
};
