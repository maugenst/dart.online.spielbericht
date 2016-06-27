'use strict';

var jsonfile = require('jsonfile');
var path = require('path');

function update(oParameters){
    // Updating table...
    var sTablesPath = oParameters.pathToTablesFiles;
    var liga = oParameters.liga;
    var oCurrentResult = oParameters.currentResults;

    var sTableFile = path.resolve(sTablesPath + '/' + liga + '.json');
    var oTabelle = jsonfile.readFileSync(sTableFile);
    if(!oTabelle[oCurrentResult.heim]) {
        oTabelle[oCurrentResult.heim] = {
            'spiele': 0, 'gewonnen': 0, 'unentschieden': 0, 'verloren': 0,
            'sets': { 'own': 0, 'other': 0 },
            'punkte': { 'own': 0, 'other': 0 }
        };
    }
    if(!oTabelle[oCurrentResult.gast]) {
        oTabelle[oCurrentResult.gast] = {
            'spiele': 0, 'gewonnen': 0, 'unentschieden': 0, 'verloren': 0,
            'sets': { 'own': 0, 'other': 0 },
            'punkte': { 'own': 0, 'other': 0 }
        };
    }

    oTabelle[oCurrentResult.heim].spiele++;
    oTabelle[oCurrentResult.gast].spiele++;

    if (oCurrentResult.summary.heim.sets > oCurrentResult.summary.gast.sets) {
        oTabelle[oCurrentResult.heim].gewonnen++;
        oTabelle[oCurrentResult.gast].verloren++;
        oTabelle[oCurrentResult.heim].punkte.own += 2;
        oTabelle[oCurrentResult.gast].punkte.other += 2;
    } else if (oCurrentResult.summary.heim.sets = oCurrentResult.summary.gast.sets) {
        oTabelle[oCurrentResult.heim].unentschieden++;
        oTabelle[oCurrentResult.gast].unentschieden++;
        oTabelle[oCurrentResult.heim].punkte.own++;
        oTabelle[oCurrentResult.heim].punkte.other++;
        oTabelle[oCurrentResult.gast].punkte.own++;
        oTabelle[oCurrentResult.gast].punkte.other++;
    } else if (oCurrentResult.summary.heim.sets < oCurrentResult.summary.gast.sets) {
        oTabelle[oCurrentResult.heim].verloren++;
        oTabelle[oCurrentResult.gast].gewonnen++;
        oTabelle[oCurrentResult.heim].punkte.other += 2;
        oTabelle[oCurrentResult.gast].punkte.own += 2;
    }
    oTabelle[oCurrentResult.heim].sets.own += oCurrentResult.summary.heim.sets;
    oTabelle[oCurrentResult.heim].sets.other += oCurrentResult.summary.gast.sets;
    oTabelle[oCurrentResult.gast].sets.own += oCurrentResult.summary.gast.sets;

    oTabelle[oCurrentResult.gast].sets.other += oCurrentResult.summary.heim.sets;
    jsonfile.writeFileSync(sTableFile, oTabelle);
}

module.exports = {
    update: update
};