'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var jade = require('jade');
var jsonfile = require('jsonfile');
var crypt = require("../helpers/Crypt");
var logger = require("../helpers/Logger");
var crypto = require('crypto');
var session = require("../helpers/Session");

function _resetAllPasswords(newPassword, res) {
    try {
        var sTeamsFile = path.resolve(config.get("bedelos.datapath") + '/Teams.json');
        var oTeams = jsonfile.readFileSync(sTeamsFile);

        for (var teamId in oTeams) {
            oTeams[teamId].password = crypt.encrypt(newPassword);
        }

        jsonfile.writeFileSync(sTeamsFile, oTeams);

        res.status(200).send("OK");

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

function getLoginform (req, res) {
    try {
        /*_resetAllPasswords('bdl', res);

        return;*/

        var oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);

        var html = jade.renderFile("api/views/loginform.jade", {
            pretty: true,
            session: oSessionData
        });

        res.status(200).send(html);

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

function login(req, res) {
    try {
        var token = crypto.randomBytes(128).toString('hex');

        var username = req.swagger.params.credentials.originalValue.username;
        var password = req.swagger.params.credentials.originalValue.password;
        var oTeams = {};
        
        if (username === config.get("bedelos.adminuser")) {
            oTeams[username] = jsonfile.readFileSync(path.resolve(config.get("bedelos.configpath") + '/config.json'))[username];
        } else {
            oTeams = jsonfile.readFileSync(path.resolve(config.get("bedelos.datapath") + '/Teams.json'));
        }

        if (oTeams[username] && oTeams[username].password && oTeams[username].password === crypt.encrypt(password)) {
            res.cookie('BDL_SESSION_TOKEN', token, {httpOnly: true});
            session.add(token, {
                username: username
            });
            res.status(200).json("OK");
        } else {
            res.clearCookie('BDL_SESSION_TOKEN');
            res.status(403).json("Login war nicht erfolgreich");
        }

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));
        logger.log.debug(error.stack);
    }
}

function logout(req, res) {
    try {
        var oSessionData = session.remove(req.cookies.BDL_SESSION_TOKEN);
        res.clearCookie('BDL_SESSION_TOKEN');
        res.send("Logged Out");
    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));
        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: getLoginform,
    post: login,
    delete: logout
};
