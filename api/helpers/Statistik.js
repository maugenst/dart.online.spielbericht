'use strict';

var jsonfile = require('jsonfile');
var path = require('path');
var _ = require('lodash');

function customizer(objValue, srcValue) {
    if (typeof srcValue === 'string') {
        return srcValue;
    } else {
        return srcValue + objValue;
    }
}

function update(oParameters){
    // Updating statistics...

    var sStatisticsPath = oParameters.pathToStatisticsFiles;
    var liga = oParameters.liga;
    var oCurrentResult = oParameters.currentResults;

    var sStatsFile = path.resolve(sStatisticsPath + '/' + liga + '.json');
    var oStatistik = {};
    oStatistik = jsonfile.readFileSync(sStatsFile);
    for(var player in oCurrentResult.playerStats) {
        if (!oStatistik[player]) {
            oStatistik[player] = oCurrentResult.playerStats[player];
        } else {
            oStatistik[player] = _.mergeWith(oStatistik[player], oCurrentResult.playerStats[player], customizer);
        }
    }
    jsonfile.writeFileSync(sStatsFile, oStatistik);
}

module.exports = {
    update: update
};