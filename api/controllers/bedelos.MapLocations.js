'use strict';
var util = require('util');
var path = require('path');
var config = require('config');
var os = require('os');
var fs = require('fs');
var jsonfile = require('jsonfile');
var logger = require('../helpers/Logger');

function getLabelInfo (sLabel, bField) {

    if (bField === undefined) {
        return "<div style='color:#000000'><b>&#x2610;</b> - " + sLabel + "</div>";
    } else if (bField === true) {
        return "<div style='color:#007900'><b>&#x2611;</b> - " + sLabel + "</div>";
    } else {
        return "<div style='color:#d20000'><b>&#x2612;</b> - " + sLabel + "</div>";
    }
}
function listInbox (req, res) {
    try {
        var sPath = path.resolve(config.get("bedelos.datapath"));
        var oTeams = jsonfile.readFileSync(sPath + '/Teams.json');

        var aLocations = [];
        for(var teamId in oTeams) {
            var aTeam = [];
            aTeam.push("'<b>" + oTeams[teamId].name + "</b><br><i>" +
                oTeams[teamId].spiellokal.name + "<br>" +
                oTeams[teamId].spiellokal.strasse + "<br>" +
                oTeams[teamId].spiellokal.ort + "</i><br>" +
                getLabelInfo('Nichtraucherlokal?', oTeams[teamId].spiellokal.nichtraucher) +
                getLabelInfo('Jugend?', oTeams[teamId].spiellokal.jugend) +
                "<hr><div style='font-size: smaller'>&#x2610; Keine Angabe | &#x2611; Ok | &#x2612; Nicht Ok</div>");
            aTeam.push(oTeams[teamId].spiellokal.position.lat);
            aTeam.push(oTeams[teamId].spiellokal.position.lng);
            aTeam.push(17);
            aLocations.push(aTeam);
        }

        res.status(200).send(aLocations);

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: listInbox
};
