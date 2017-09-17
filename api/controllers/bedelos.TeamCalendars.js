'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var pug = require('pug');
var jsonfile = require('jsonfile');
var walker = require('walker');
var _ = require('lodash');
var logger = require('../helpers/Logger');
var session = require('../helpers/Session');
var Spielplan = require('../helpers/Spielplan');
var moment = require('moment');
const ical = require('ical-generator');

const fs = require('fs-extra');

function sortBySpieltag(a, b) {
    var t1 = parseInt(a.spieltag.split('_')[1]);
    var t2 = parseInt(b.spieltag.split('_')[1]);
    if (t1 < t2) {
        return -1;
    } else if (t1 === t2) {
        return 0;
    } else {
        return 1;
    }
}

function getTeamSpielplan(req, res) {
    try {
        var teamId = req.swagger.params.teamId.raw;

        var sPath = path.resolve(config.get('bedelos.datapath'));
        if (req.swagger.params.saison && req.swagger.params.saison.raw) {
            sPath = path.dirname(sPath);
            sPath = path.resolve(sPath, req.swagger.params.saison.raw);
        }
        var oSpielplan = require(path.resolve(sPath, 'Spielplan.json'));
        var oTeams = require(path.resolve(sPath, 'Teams.json'));

        var spielplanHelper = new Spielplan(oSpielplan, oTeams);
        var aSpiele = spielplanHelper.getFilteredGamesMap({heim: teamId});
        var bSpiele = spielplanHelper.getFilteredGamesMap({gast: teamId});
        var alleSpiele = aSpiele.concat(bSpiele);
        alleSpiele.sort(sortBySpieltag);

        var alleGegner = {};

        const aEvents = [];

        for (var i = 0; i < alleSpiele.length; i++) {
            var sFilename = path.resolve(sPath + '/ergebnisse/' + alleSpiele[i].id + '.json');
            if (fs.existsSync(sFilename)) {
                var oResult = jsonfile.readFileSync(sFilename);
                alleSpiele[i].summary = oResult.summary;
            }
            const summaryPrefix = alleSpiele[i].heim === teamId ? 'Heim-' : 'Auswärts-';
            aEvents.push({
                start: moment(alleSpiele[i].datum + ', 20:00', 'ddd. DD.MM.YYYY, HH:mm').toDate(),
                end: moment(alleSpiele[i].datum + ', 20:00', 'ddd. DD.MM.YYYY, HH:mm').add(4, 'h').toDate(),
                timestamp: new Date(),
                summary: `${summaryPrefix}Spieltag (#${i + 1})`,
                description: `${alleSpiele[i].heimName} vs. ${alleSpiele[i].gastName}`,
                organizer: `${oTeams[teamId].teamvertreter.name} <${oTeams[teamId].teamvertreter.mail}>`,
                location: `${oTeams[alleSpiele[i].heim].spiellokal.name}, ${oTeams[alleSpiele[i].heim].spiellokal
                    .strasse}, ${oTeams[alleSpiele[i].heim].spiellokal.ort}`
            });
        }

        const cal = ical({
            domain: 'badischedartliga.de',
            prodId: '//badischedartliga.de//ical-generator//DE',
            events: aEvents
        }).toString();

        const file = `TeamCalender${teamId}.ics`;

        fs.outputFile(file, cal, err => {
            res.download(file, file, function(err) {});
        });
    } catch (error) {
        res.status(500).send('Error: ' + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: getTeamSpielplan,
    post: getTeamSpielplan
};
