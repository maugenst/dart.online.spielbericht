'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var pug = require('pug');
var jsonfile = require('jsonfile');
var crypt = require("../helpers/Crypt");
var logger = require("../helpers/Logger");
var crypto = require('crypto');
var session = require("../helpers/Session");

function getLoginform (req, res) {
    try {
        var oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);

        var html = pug.renderFile("api/views/loginform.jade", {
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

        var username = req.swagger.params.credentials.raw.username;
        var password = req.swagger.params.credentials.raw.password;
        var adminUser = config.get("bedelos.adminuser");
        var oTeams = {};

        oTeams = jsonfile.readFileSync(path.resolve(config.get("bedelos.datapath") + '/Teams.json'));
        oTeams[adminUser] = jsonfile.readFileSync(path.resolve(config.get("bedelos.configpath") + '/config.json'))[adminUser];

        if (oTeams[username] && oTeams[username].password) {
            if (!oTeams[username].password.changeDate || (oTeams[username].password.changeDate - Date.now()) < 0) {
                res.cookie('BDL_SESSION_REDIRECT', '/bedelos/changePassword/user/' + username);
                res.status(200).json("REDIRECT");
                return;
            } else {
                var encPwd = crypt.encrypt(password);
                if (oTeams[username].password.value === encPwd || oTeams[adminUser].password.value === encPwd) {
                    res.cookie('BDL_SESSION_TOKEN', token);
                    session.add(token, {
                        username: username
                    });
                    res.status(200).json("OK");
                    return;
                }
            }
        }
        res.clearCookie('BDL_SESSION_TOKEN');
        res.status(403).json("Login war nicht erfolgreich");
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
