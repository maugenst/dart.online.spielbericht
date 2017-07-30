'use strict';
var vereine = require('./data/saison/1617/Vereine.json');
var teams = require('./data/saison/1617/Teams.json');
var fs = require('fs');

let out = [];
out.push(`sep=;\nVerein;Spiellokal;Strasse;Ort`);
for (var team in teams) {
    out.push(`${teams[team].name};${teams[team].spiellokal.name};${teams[team].spiellokal.strasse};${teams[team].spiellokal.ort}`);
}

fs.writeFileSync('spiellokale.csv', out.join('\n'));

let out2 = [];
for (var team in teams) {
    out2.push(`${teams[team].teamvertreter.mail}`);
}

fs.writeFileSync('emails.txt', out2.join('; '));
