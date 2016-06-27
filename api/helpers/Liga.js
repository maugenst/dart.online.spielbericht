'use strict';

/**
 * Created by D032233 on 27.06.2016.
 */

var path = require('path');

function calcLigaFromString(sLigaString) {
    if (sLigaString.startsWith('kls')) {
        return 'klsued';
    } else if (sLigaString.startsWith('kln')) {
        return 'klnord';
    } else if (sLigaString.startsWith('bzli')) {
        return 'bzLiga';
    } else if (sLigaString.startsWith('ol')) {
        return 'oberliga';
    }
}

function calcLigaFromFilename(file) {
    var match = /^[a-zA-Z0-9]{6}_(.+)\.json/g.exec(path.basename(file));
    if (match) {
        return calcLigaFromString(match[1]);
    } else {
        return calcLigaFromString(path.basename(file));
    }
}

module.exports = {
    calcLigaFromFilename: calcLigaFromFilename,
    calcLigaFromString: calcLigaFromString
};