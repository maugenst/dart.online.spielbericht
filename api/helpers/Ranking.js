'use strict';
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

function generateRankingArray(oStatistic, oTeams) {
    var aRanking = [];
    for (var player in oStatistic) {
        if(oStatistic[player].name.indexOf(">Freilos<") !== -1) {
            continue;
        }

        var oTmp = oStatistic[player];
        oTmp.name = oStatistic[player].name;
        oTmp.punkte = calcPlayerScore(oTmp);
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

module.exports = {
    sortTableByRank : sortTableByRank,
    sortStatisticByScores : sortStatisticByScores,
    sortStatisticByNames : sortStatisticByNames
};