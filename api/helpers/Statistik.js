'use strict';

var jsonfile = require('jsonfile');
var path = require('path');
var _ = require('lodash');

var currentResults = {
};

function customizer(objValue, srcValue) {
    if (_.isString(srcValue)) {
        return srcValue;
    } else if (_.isObject(srcValue)) {
        return _.mergeWith(objValue, srcValue, customizer);
    } else if (_.isInteger(srcValue)) {
        return objValue ? srcValue + objValue : srcValue;
    }
}

function hasValue(object, path) {
    let bRet = false;

    if (_.has(object, path)) {
        const value = _.get(object, path);
        bRet = !!value;
    }
    return bRet;
}

function getStatName(name, team) {
    return `${name} (${team})`;
}

function specialsToArray(cValue) {
    var aRet = [];
    if (cValue && _.isString(cValue)) {
        var sRepl = '' + cValue;
        sRepl = sRepl.replace(/\D/g, '_');
        sRepl = sRepl.replace(/__+/g, '_');
        aRet = sRepl.split('_');
    }
    return aRet;
}

function addSpecialsPerPlayer(statName, oDetails) {
    let aHF = specialsToArray(oDetails.highfinishes);
    let aSL = specialsToArray(oDetails.shortlegs);
    let aMAX = specialsToArray(oDetails.i180er);

    aHF.forEach(hf => {
        if (hasValue(currentResults.playerStats[statName], `hf.${hf}`)) {
            currentResults.playerStats[statName].hf[hf]++;
        } else {
            currentResults.playerStats[statName].hf[hf] = 1;
        }
    });
    aSL.forEach(sl => {
        if (hasValue(currentResults.playerStats[statName], `sl.${sl}`)) {
            currentResults.playerStats[statName].sl[sl]++;
        } else {
            currentResults.playerStats[statName].sl[sl] = 1;
        }
    });
    aMAX.forEach(max => {
        if (max === '1') {
            max = '180';
        }
        if (hasValue(currentResults.playerStats[statName], `max.${max}`)) {
            currentResults.playerStats[statName].max[max]++;
        } else {
            currentResults.playerStats[statName].max[max] = 1;
        }
    });
}

function initPlayerStatistics(name, team) {
    const statname = getStatName(name, team);
    if (!currentResults.playerStats[statname].single) {
        currentResults.playerStats[statname] = {
            single: {
                '3:0': 0,
                '3:1': 0,
                '3:2': 0,
                '2:3': 0,
                '1:3': 0,
                '0:3': 0
            },
            double: {
                '3:0': 0,
                '3:1': 0,
                '3:2': 0,
                '2:3': 0,
                '1:3': 0,
                '0:3': 0
            },
            hf: {},
            sl: {},
            max: {},
            name: name,
            team: team
        };

    }
}

function addPlayerStatisticsForSingles(gameIndex) {
    const heim = currentResults.heim;
    const gast = currentResults.gast;

    const oDetailsPlayer1 = _.get(currentResults, `${gameIndex}.spieler1`);
    const oDetailsPlayer2 = _.get(currentResults, `${gameIndex}.spieler2`);

    let statName1 = getStatName(oDetailsPlayer1.name, heim);
    let statName2 = getStatName(oDetailsPlayer2.name, gast);

    initPlayerStatistics(oDetailsPlayer1.name, heim);
    initPlayerStatistics(oDetailsPlayer2.name, gast);

    currentResults.playerStats[statName1].single[oDetailsPlayer1.legs + ':' + oDetailsPlayer2.legs]++;
    currentResults.playerStats[statName2].single[oDetailsPlayer2.legs + ':' + oDetailsPlayer1.legs]++;

    addSpecialsPerPlayer(statName1, oDetailsPlayer1);
    addSpecialsPerPlayer(statName2, oDetailsPlayer2);
}

function addPlayerStatisticsForDoubles(gameIndex) {
    const heim = currentResults.heim;
    const gast = currentResults.gast;

    const oDetailsTeam1 = _.get(currentResults, `${gameIndex}.paar1`);
    const oDetailsTeam2 = _.get(currentResults, `${gameIndex}.paar2`);
    const oDetailsTeam1Player1 = _.get(currentResults, `${gameIndex}.paar1.spieler1`);
    const oDetailsTeam1Player2 = _.get(currentResults, `${gameIndex}.paar1.spieler2`);
    const oDetailsTeam2Player1 = _.get(currentResults, `${gameIndex}.paar2.spieler1`);
    const oDetailsTeam2Player2 = _.get(currentResults, `${gameIndex}.paar2.spieler2`);

    let statTeam1Name1 = getStatName(oDetailsTeam1Player1.name, heim);
    let statTeam1Name2 = getStatName(oDetailsTeam1Player2.name, heim);
    let statTeam2Name1 = getStatName(oDetailsTeam2Player1.name, gast);
    let statTeam2Name2 = getStatName(oDetailsTeam2Player2.name, gast);

    initPlayerStatistics(oDetailsTeam1Player1.name, heim);
    initPlayerStatistics(oDetailsTeam1Player2.name, heim);
    initPlayerStatistics(oDetailsTeam2Player1.name, gast);
    initPlayerStatistics(oDetailsTeam2Player2.name, gast);

    currentResults.playerStats[statTeam1Name1].double[oDetailsTeam1.legs + ':' + oDetailsTeam2.legs]++;
    currentResults.playerStats[statTeam1Name2].double[oDetailsTeam1.legs + ':' + oDetailsTeam2.legs]++;
    currentResults.playerStats[statTeam2Name1].double[oDetailsTeam2.legs + ':' + oDetailsTeam1.legs]++;
    currentResults.playerStats[statTeam2Name2].double[oDetailsTeam2.legs + ':' + oDetailsTeam1.legs]++;

    addSpecialsPerPlayer(statTeam1Name1, oDetailsTeam1Player1);
    addSpecialsPerPlayer(statTeam1Name2, oDetailsTeam1Player2);
    addSpecialsPerPlayer(statTeam2Name1, oDetailsTeam2Player1);
    addSpecialsPerPlayer(statTeam2Name2, oDetailsTeam2Player2);
}

function update(oParameters) {
    // Updating statistics...

    var sStatisticsPath = oParameters.pathToStatisticsFiles;
    var liga = oParameters.liga;
    currentResults = _.cloneDeep(oParameters.currentResults);

    if (Object.keys(currentResults.playerStats).length === 0) {
        return;
    }

    var sStatsFile = path.resolve(sStatisticsPath + '/' + liga + '.json');
    var oStatistik = {};
    oStatistik = jsonfile.readFileSync(sStatsFile);

    const re = /(e|d)\db\d/g;

    for (var key in currentResults) {
        const found = key.match(re);
        if (found) {
            if (key.startsWith('e')) {
                addPlayerStatisticsForSingles(key);
            } else {
                addPlayerStatisticsForDoubles(key);
            }
        }
    }

    for (var player in currentResults.playerStats) {
        if (!oStatistik[player]) {
            oStatistik[player] = currentResults.playerStats[player];
        } else {
            oStatistik[player] = _.mergeWith(oStatistik[player], currentResults.playerStats[player], customizer);
        }
    }
    jsonfile.writeFileSync(sStatsFile, oStatistik, {spaces: 4});
}

module.exports = {
    update: update
};
