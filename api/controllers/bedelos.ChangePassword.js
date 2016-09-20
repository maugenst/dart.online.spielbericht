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
var moment = require('moment');

function resetAllPasswords(req, res) {
    try {

        /*var oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);

        if (!oSessionData) {
            res.cookie('BDL_SESSION_REDIRECT', req.url);
            res.redirect("/bedelos/login");
            return;
        }

        if (oSessionData.username !== config.get("bedelos.adminuser")) {
            res.status(200).send(pug.renderFile("api/views/authorizederror.jade"));
            return;
        }*/

        var newPassword = 'bdl';
        var sTeamsFile = path.resolve(config.get("bedelos.datapath") + '/Teams.json');
        var oTeams = jsonfile.readFileSync(sTeamsFile);

        for (var teamId in oTeams) {
            oTeams[teamId].password = {
                value: crypt.encrypt(newPassword), 
                changeDate: Date.now()
            };
            oTeams[teamId].needsChange = true;
            oTeams[teamId].encTeam = new Buffer(oTeams[teamId].name).toString('base64');
        }

        jsonfile.writeFileSync(sTeamsFile, oTeams);

        res.status(200).send("OK");

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

function getChangePasswordForm (req, res) {
    try {
        var oSessionData = session.get(req.cookies.BDL_SESSION_TOKEN);

        var html = pug.renderFile("api/views/changePasswordForm.jade", {
            pretty: true,
            session: oSessionData,
            username: req.swagger.params.username.raw
        });

        res.status(200).send(html);

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

function resetPassword(req, res) {
    try {
        var token = crypto.randomBytes(128).toString('hex');

        var username = req.swagger.params.credentials.raw.username;
        var oldPassword = req.swagger.params.credentials.raw.oldPassword;
        var newPassword = req.swagger.params.credentials.raw.newPassword;
        var repeatNewPassword = req.swagger.params.credentials.raw.repeatNewPassword;
        var oTeams = {};

        if (newPassword !== repeatNewPassword) {
            res.status(481).json("ERROR: Neue Passwörter stimmen nicht überein.");
            return;
        }
        var filename = "";

        if (username === config.get("bedelos.adminuser")) {
            filename = path.resolve(config.get("bedelos.configpath") + '/config.json');
            var oConfig = jsonfile.readFileSync(filename);
            if (oConfig[username] && oConfig[username].password && typeof oConfig[username].password === 'object') {
                if (oConfig[username].password.value === "" || oConfig[username].password.value === crypt.encrypt(oldPassword)) {
                    res.cookie('BDL_SESSION_TOKEN', token, {httpOnly: true});
                    session.add(token, {
                        username: username
                    });
                } else {
                    res.status(480).json("ERROR: Fehler bei altem Passwort.");
                    return;
                }
                oConfig[username].password = {
                    value: crypt.encrypt(newPassword),
                    changeDate: moment().add(1, 'year').toDate().getTime()
                };
                jsonfile.writeFileSync(filename, oConfig);
            }
        } else {
            filename = path.resolve(config.get("bedelos.datapath") + '/Teams.json');
            var oTeams = jsonfile.readFileSync(filename);
            var adminUser = config.get("bedelos.adminuser");
            oTeams[adminUser] = jsonfile.readFileSync(path.resolve(config.get("bedelos.configpath") + '/config.json'))[adminUser];
            if (oTeams[username] && oTeams[username].password) {
                if (oTeams[username].password.value === "" || oTeams[username].password.value === crypt.encrypt(oldPassword)  || oTeams[adminUser].password.value === crypt.encrypt(oldPassword)) {
                    res.cookie('BDL_SESSION_TOKEN', token, {httpOnly: true});
                    session.add(token, {
                        username: username
                    });
                } else {
                    res.status(480).json("ERROR: Fehler bei altem Passwort.");
                    return;
                }
            }
            oTeams[username].password = {
                value: crypt.encrypt(newPassword),
                changeDate: moment().add(1, 'year').toDate().getTime()
            };
            jsonfile.writeFileSync(filename, oTeams);
        }
        res.status(200).json("Passwordänderung war erfolgreich");
    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));
        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: getChangePasswordForm,
    post: resetPassword,
    delete: resetAllPasswords
};
