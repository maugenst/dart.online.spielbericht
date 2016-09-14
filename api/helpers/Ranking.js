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
    iRet += oPlayer['3:0'] * 5;
    iRet += oPlayer['3:1'] * 4;
    iRet += oPlayer['3:2'] * 3;
    iRet += oPlayer['2:3'] * 2;
    iRet += oPlayer['1:3'] * 1;
    iRet += oPlayer.hf * 1;
    iRet += oPlayer.sl * 1;
    iRet += oPlayer.max * 1;
    return iRet;
}

function sortStatisticByScores(oStatistic, oTeams) {
    var aRanking = [];
    for (var player in oStatistic) {
        var oTmp = oStatistic[player];
        oTmp.name = oStatistic[player].name;
        oTmp.punkte = calcPlayerScore(oTmp);
        aRanking.push(oTmp);
    }
    aRanking.sort(sortStatisticsByResults);
    return aRanking;
}

module.exports = {
    sortTableByRank : sortTableByRank,
    sortStatisticByScores : sortStatisticByScores
};