'use strict';

/**
 * Created by D032233 on 27.06.2016.
 */

var path = require('path');
var config = require('config');
var _ = require('lodash');

let oLigen = config.get('bedelos.ligen');

function isUpdateNeeded(file, liga) {
    if (liga === 'all') {
        return (path.extname(file) === '.json');
    } else {
        return (path.basename(file).indexOf(liga) === 0 && path.extname(file) === '.json');
    }
}

function calcLigaFromString(sLigaString) {
    let liga = _.findKey(oLigen, liga => {
        return (sLigaString.toLowerCase().startsWith(liga.prefix.toLowerCase()));
    });

    return liga || sLigaString;
}

function getShort(sLiga) {
    return (_.has(oLigen, sLiga)) ? oLigen[sLiga].prefix : "";
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
    var sLiga = calcLigaFromString(liga).toLowerCase();
    return (_.has(oLigen, sLiga)) ? oLigen[sLiga].name : "";
}

module.exports = {
    calcLigaFromFilename: calcLigaFromFilename,
    calcLigaFromString: calcLigaFromString,
    getFullLigaName: getFullLigaName,
    isUpdateNeeded: isUpdateNeeded,
    getGameIndex: getGameIndex
};