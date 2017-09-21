'use strict';

const path = require('path');
const config = require('config');
const jsonfile = require('jsonfile');
const logger = require('../helpers/Logger');
const session = require('../helpers/Session');
const pug = require('pug');
const Spielplan = require('../helpers/Spielplan');

function switchGame(req, res) {
    try {
        var oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);

        if (!oSessionData) {
            res.cookie('BDL_SESSION_REDIRECT', req.url);
            res.redirect('/bedelos/login');
            return;
        }

        if (oSessionData.username !== config.get('bedelos.adminuser')) {
            res.status(200).send(pug.renderFile('api/views/authorizederror.jade'));
            return;
        }

        var sPath = path.resolve(config.get('bedelos.datapath'));
        let oSpielplan = jsonfile.readFileSync(sPath + '/Spielplan.json');
        var oTeams = require(sPath + '/Teams.json');

        var sGameId = req.swagger.params.gameId.raw;

        let spielplanHelper = new Spielplan(oSpielplan, oTeams);
        const oRet = spielplanHelper.switchTeams(sGameId);

        logger.log.debug(`Switched teams in game ${sGameId}, liga ${oRet.liga}, runde ${oRet.runde}`);

        jsonfile.writeFileSync(sPath + '/Spielplan.json', spielplanHelper.getSpielplan());

        res.redirect(`/bedelos/spielplan?liga=${oRet.liga}&runde=${oRet.runde}&reload=1`);
    } catch (error) {
        res.status(500).send('Error: ' + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: switchGame
};
