'use strict';

const path = require('path');
const config = require('config');
const fse = require('fs-extra');
const logger = require('../helpers/Logger');
const session = require('../helpers/Session');
const pug = require('pug');
const Spielplan = require('../helpers/Spielplan');

function switchGame(req, res) {
    try {
        var sGameId = req.swagger.params.gameId.raw;
        logger.log.info(`Switching teams in game: ${sGameId}`);

        var oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);
        if (!oSessionData) {
            //res.cookie('BDL_SESSION_REDIRECT', req.url);
            res.redirect('/bedelos/login');
            return;

        }
        if (oSessionData.username !== config.get('bedelos.adminuser')) {
            res.status(200).send(pug.renderFile('api/views/authorizederror.jade'));
            return;

        }

        logger.log.info('Start reading Spielplan.json');
        var sPath = path.resolve(config.get('bedelos.datapath'));

        const pSpielplan = fse.readJson(sPath + '/Spielplan.json');
        const pTeams = fse.readJson(sPath + '/Teams.json');

        Promise.all([pSpielplan, pTeams]).then(values => {

            const oSpielplan = values[0];
            const oTeams = values[1];

            logger.log.info('Finished Spielplan.json');

            logger.log.info('Processing Spielplan');
            let spielplanHelper = new Spielplan(oSpielplan, oTeams);
            logger.log.info('Switching teams');
            const oRet = spielplanHelper.switchTeams(sGameId);

            logger.log.info(`Switched teams in game ${sGameId}, liga ${oRet.liga}, runde ${oRet.runde}`);

            fse.writeJson(sPath + '/Spielplan.json', spielplanHelper.getSpielplan(), {spaces: 2}).then(() => {

                res.redirect(`/bedelos/spielplan?liga=${oRet.liga}&runde=${oRet.runde}`);

            });
        });
    } catch (error) {
        res.status(500).send('Error: ' + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: switchGame
};
