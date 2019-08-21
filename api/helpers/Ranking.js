'use strict';
const _ = require('lodash');
/**
 * Created by d032233 on 24.03.2016.
 */
function checkValue(valA, valB, descending) {
    return (descending) ? valA-valB : valB-valA;
}

function sortTableByResults(a, b) {
    var ret = checkValue(a.punkte.own, b.punkte.own, false);
    if (ret === 0) {
        ret = checkValue(a.punkte.other, b.punkte.other, true);
        if (ret === 0) {
            ret = checkValue(a.sets.own, b.sets.own, false);
            if (ret === 0) {
                ret = checkValue(a.sets.other, b.sets.other, true);
            }
        }
    }
    return ret;
}

function sortStatisticsByResults(a, b) {
    return checkValue(a.punkte, b.punkte, false);
}

function sortStatisticsByName(a, b) {
    if(a.name < b.name) return -1;
    if(a.name > b.name) return 1;
    return 0;
}

function sortTableByRank(oTable) {
    var aRanking = [];
    for (var team in oTable) {
        var oTmp = oTable[team];
        oTmp.name = team;
        aRanking.push(oTmp);
    }
    aRanking.sort(sortTableByResults);
    return aRanking;
}

function calcPlayerScore(oPlayer) {
    var iRet = 0;
    iRet += oPlayer['3:0'] * 2;
    iRet += oPlayer['3:1'] * 2;
    iRet += oPlayer['3:2'] * 2;
    iRet += oPlayer.hf * 0.5;
    iRet += oPlayer.sl * 0.5;
    iRet += oPlayer.max * 0.5;
    return iRet;
}

function calcPlayerScoreNew(oPlayer) {
    var iRet = 0;
    iRet += oPlayer.single['3:0'] * 2;
    iRet += oPlayer.single['3:1'] * 2;
    iRet += oPlayer.single['3:2'] * 2;
    iRet += oPlayer.double['3:0'];
    iRet += oPlayer.double['3:1'];
    iRet += oPlayer.double['3:2'];
    return iRet;
}

function calcHighFinishes(oPlayer) {
    var iRet = 0;
    for(var hfs in oPlayer.hf) {
        iRet += oPlayer.hf[hfs];
    }
    return iRet;
}

function calcShortLegs(oPlayer) {
    var iRet = 0;
    for(var sls in oPlayer.sl) {
        iRet += oPlayer.sl[sls];
    }
    return iRet;
}

function calcMaxima(oPlayer) {
    var iRet = 0;
    for(var maximas in oPlayer.max) {
        iRet += oPlayer.max[maximas];
    }
    return iRet;
}

function generateRankingArray(oStatistic, oTeams) {
    var aRanking = [];
    for (var player in oStatistic) {
        if(oStatistic[player].name.indexOf(">Freilos<") !== -1) {
            continue;
        }

        var oTmp = oStatistic[player];
        oTmp.name = oStatistic[player].name;
        if (_.isObject(oTmp.hf)) {
            oTmp.punkte = calcPlayerScoreNew(oTmp);
            oTmp.sums = {
                hf: calcHighFinishes(oTmp),
                sl: calcShortLegs(oTmp),
                max: calcMaxima(oTmp)
            };
        } else {
            oTmp.punkte = calcPlayerScore(oTmp);
        }
        aRanking.push(oTmp);
    }
    return aRanking;
}

function sortStatisticByScores(oStatistic, oTeams) {
    var aRanking = generateRankingArray(oStatistic, oTeams);
    return aRanking.sort(sortStatisticsByResults);
}

function sortStatisticByNames(oStatistic, oTeams) {
    var aRanking = generateRankingArray(oStatistic, oTeams);
    return aRanking.sort(sortStatisticsByName);
}

function sortStatisticByTeamAndNames(oStatistic, oTeams) {
    var aRanking = generateRankingArray(oStatistic, oTeams);
    const obj = {};
    aRanking.forEach(stat => {
        if (!obj[stat.team]) {
          obj[stat.team] = [];
        }
        obj[stat.team].push(stat);
        obj[stat.team].sort(sortStatisticsByName);
    });
    let aRet = [];
    for (const key in obj) {
        aRet = aRet.concat(obj[key]);
    }
    return aRet;
}

module.exports = {
    sortTableByRank : sortTableByRank,
    sortStatisticByScores : sortStatisticByScores,
    sortStatisticByNames : sortStatisticByNames,
    sortStatisticByTeamAndNames : sortStatisticByTeamAndNames
};
