'use strict';

/**
 * Created by D032233 on 27.06.2016.
 */

var path = require('path');

function isUpdateNeeded(file, liga) {
    if (liga === 'all') {
        return (path.extname(file) === '.json');
    } else {
        return (path.basename(file).indexOf(liga) === 0 && path.extname(file) === '.json');
    }
}

function calcLigaFromString(sLigaString) {
    if (sLigaString.startsWith('kls')) {
        return 'klsued';
    } else if (sLigaString.startsWith('kln')) {
        return 'klnord';
    } else if (sLigaString.startsWith('bzLi')) {
        return 'bzLiga';
    } else if (sLigaString.startsWith('ol')) {
        return 'oberliga';
    }
    return sLigaString;
}

function getShort(sLiga) {
    var ret = "";
    switch(sLiga) {
        case 'klsued': ret = "kls";
            break;
        case 'klnord': ret = "kln";
            break;
        case 'bzLiga': ret = "bzli";
            break;
        case 'oberliga': ret = "ol";
            break;
    }
    return ret;
}

function pad(num, size) {
    var s = "000" + num;
    return s.substr(s.length-size);
}

function getGameIndex(liga, iIdx) {
    return getShort(liga) + pad(iIdx, 3);
}

function calcLigaFromFilename(file) {
    var match = /^[a-zA-Z0-9]{6}_(.+)\.json/g.exec(path.basename(file));
    if (match) {
        return calcLigaFromString(match[1]);
    } else {
        return calcLigaFromString(path.basename(file));
    }
}

function getFullLigaName(liga) {
    var sLiga = calcLigaFromString(liga);
    var sRet = "";
    switch(sLiga) {
        case ('klsued') : sRet = "Kreisliga Süd";
            break;
        case ('klnord') : sRet = "Kreisliga Nord";
            break;
        case ('bzLiga') : sRet = "Bezirksliga";
            break;
        case ('oberliga') : sRet = "Oberliga";
            break;
        default: sRet = "liga";
            break;
    }
    return sRet;
}

module.exports = {
    calcLigaFromFilename: calcLigaFromFilename,
    calcLigaFromString: calcLigaFromString,
    getFullLigaName: getFullLigaName,
    isUpdateNeeded: isUpdateNeeded,
    getGameIndex: getGameIndex
};