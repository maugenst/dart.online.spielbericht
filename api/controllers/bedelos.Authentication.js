'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var jade = require('jade');
var jsonfile = require('jsonfile');
var logger = require("../helpers/Logger");

function getLoginform (req, res) {
    try {
        var html = jade.renderFile("api/views/loginform.jade", {
            pretty: true
        });

        res.status(200).send(html);

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

function login(req, res) {
    try {
        var username = req.swagger.params.credentials.originalValue.username;
        var password = req.swagger.params.credentials.originalValue.password;
        var html = jade.renderFile("api/views/loginform.jade");

        res.status(200).send(html);

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

function logout(req, res) {

}

module.exports = {
    get: getLoginform,
    post: login,
    delete: logout
};
