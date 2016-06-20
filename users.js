'use strict';
var uid = require('./api/helpers/UID');
var teams = require('./data/saison/1516/Teams.json');
var fs = require('fs');

for (var team in teams) {
    fs.appendFileSync('genpasswd.sh', 'htpasswd -b .htpasswd.usermanagement ' + team + ' ' + uid.generate() + '\n');
}
