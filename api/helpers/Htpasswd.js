'use strict';
/**
 * Created by d032233 on 24.03.2016.
 */

var fs = require('fs');
var path = require('path');
var htpasswd = require('htpasswd');

var oUser = {};
initialize();

function initialize (sFilename){
    var sFname = sFilename || __dirname + '../../../users.htpasswd';
    var file = fs.readFileSync(path.resolve(sFname)).toString();
    oUser = {};
    var lines = file.split('\n');
    lines.forEach(function (line) {
        if (line.trim() !== "" && line.indexOf(':') !== -1) {
            line = line.split(':');
            oUser[line[0]] = line[1];
        }
    });
    return Object.keys(oUser).length;
}

function authenticate (user, password){
    if (oUser[user]) {
        return htpasswd.verify(oUser[user], password);
    }
    return false;
}

module.exports = {
    authenticate: authenticate,
    initialize: initialize
}
