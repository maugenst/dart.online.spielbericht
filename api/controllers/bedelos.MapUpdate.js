'use strict';
var bbPromise = require('bluebird');
var async = require('asyncawait').async;
var await = require('asyncawait').await;
var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var jade = require('jade');
var nodemailer = require("nodemailer");
var jsonfile = require('jsonfile');
var request = bbPromise.promisifyAll(require('request'));
var _ = require('lodash');

var oRequestData = {
    'url' : '',
    'headers' : {
        'Cache-Control' : 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0',
        'User-Agent' : 'Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; rv:11.0) like Gecko',
        'Accept-Language': 'de-DE',
        'Connection' : 'keep-alive',
    },
    'proxy': 'http://proxy:8080'
};

function listInbox (req, res) {
    try {
        var sTeamsFilename = path.resolve(config.get("bedelos.datapath") + '/Teams.json');
        var oTeams = require(sTeamsFilename);

        for(var team in oTeams) {
            oTeams[team].spiellokal.position = {
                lat: 0.0,
                lng: 0.0
            };

            var url = "http://maps.google.com/maps/api/geocode/json?address=";
            url += encodeURI(oTeams[team].spiellokal.strasse.replace(/\s/g, '+'));
            url += encodeURI('+' + oTeams[team].spiellokal.ort.replace(/\s/g, '+'));
            url += "&sensor=false";
            oRequestData.url = url;
            var oResponse = await(request.getAsync(oRequestData));
            var oPositions = JSON.parse(oResponse.body);
            if (oPositions.status === "OK") {
                oTeams[team].spiellokal.position.lat = oPositions.results[0].geometry.location.lat;
                oTeams[team].spiellokal.position.lng = oPositions.results[0].geometry.location.lng;
            }
            await(bbPromise.delay(200).then(function(){return null;}));
        }

        //jsonfile.writeFileSync(sTeamsFilename, oTeams);

        var html = jade.renderFile("api/views/locationDetails.jade", {
            pretty: true,
            teams: oTeams
        });

        res.status(200).send(html);

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));
    }
}

module.exports = {
    get: async(listInbox)
};
