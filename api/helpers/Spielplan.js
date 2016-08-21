'use strict';

/**
 * Created by D032233 on 27.06.2016.
 */

var path = require('path');
var ligaHelper = require('./Liga');
var logger = require('./Logger');

class Spielplan {
    constructor (oSpielplan, oTeams){
        this._oSpielplan = oSpielplan;
        if (!oTeams) {
            throw new Error("Missing oTeams in constructor properties for object initialization.");
        }
        this._oTeams = oTeams;
        this.update();
    }

    update() {
        this.oGamesMap = {};
        for (var liga in this._oSpielplan) {
            for (var runde in this._oSpielplan[liga]) {
                if (runde === 'rr' || runde === 'vr') {
                    for (var spieltag in this._oSpielplan[liga][runde]) {
                        for (var i = 0; i<this._oSpielplan[liga][runde][spieltag].length; i++) {
                            var spiel = this._oSpielplan[liga][runde][spieltag][i];
                            if (this.oGamesMap[spiel.id]) {
                                logger.log.warn("WARN: Found double ID in spielplan: " + spiel.id);
                            }
                            if (!this._oTeams[spiel.heim]) {
                                logger.log.warn("WARN: No team found: " + spiel.heim);
                                break;
                            }
                            if (!this._oTeams[spiel.gast]) {
                                logger.log.warn("WARN: No team found: " + spiel.gast);
                                break;
                            }
                            this.oGamesMap[spiel.id] = spiel;
                            this.oGamesMap[spiel.id].liga = liga;
                            this.oGamesMap[spiel.id].spieltag = spieltag;
                            this.oGamesMap[spiel.id].runde = runde;
                            if (spiel.spielfrei) {
                                this.oGamesMap[spiel.id].spielfrei = spiel.spielfrei;
                                this.oGamesMap[spiel.id].spielfreiName = this._oTeams[spiel.spielfrei].name;
                            } else {
                                this.oGamesMap[spiel.id].heimName = this._oTeams[spiel.heim].name;
                                this.oGamesMap[spiel.id].gastName = this._oTeams[spiel.gast].name;
                            }
                        }
                    }
                }
            }
        }
    }

    getFullGameInfo(sGameID) {
        var ret = {};
        var liga = ligaHelper.calcLigaFromString(sGameID);
        for (var spieltag in this._oSpielplan[liga].vr) {
            for (var i = 0; this._oSpielplan[liga].vr[spieltag].length; i++) {
                var spiel = this._oSpielplan[liga].vr[spieltag][i];
                if (spiel.id === sGameID) {
                    ret = spiel;
                    ret.liga = liga;
                    ret.spieltag = spieltag;
                    ret.runde = 'vr';
                    return ret;
                }
            }
        }
        for (var spieltag in this._oSpielplan[liga].rr) {
            for (var i = 0; this._oSpielplan[liga].rr[spieltag].length; i++) {
                var spiel = this._oSpielplan[liga].rr[spieltag][i];
                if (spiel.id === sGameID) {
                    ret = spiel;
                    ret.liga = liga;
                    ret.spieltag = spieltag;
                    ret.runde = 'rr';
                    return ret;
                }
            }
        }
        return ret;
    }

    removeGame(sGameID) {
        var liga = ligaHelper.calcLigaFromString(sGameID);
        for (var spieltag in this._oSpielplan[liga].vr) {
            for (var i = 0; i<this._oSpielplan[liga].vr[spieltag].length; i++) {
                var spiel = this._oSpielplan[liga].vr[spieltag][i];
                if (spiel.id === sGameID) {
                    this._oSpielplan[liga].vr[spieltag].splice(i, 1);
                }
            }
        }
        for (var spieltag in this._oSpielplan[liga].rr) {
            for (var i = 0; i<this._oSpielplan[liga].rr[spieltag].length; i++) {
                var spiel = this._oSpielplan[liga].rr[spieltag][i];
                if (spiel.id === sGameID) {
                    this._oSpielplan[liga].vr[spieltag].splice(i, 1);
                }
            }
        }
        logger.log.debug("Removed game from spielplan: " + sGameID);
    }

    addGame(oGamePayload) {
        while (this.oGamesMap[oGamePayload.spielIndex]) {
            logger.log.warn("WARN: Found ID already in spielplan: " + oGamePayload.spielIndex);
            oGamePayload.spielIndex = this.increaseGameIndex(oGamePayload.liga);
            logger.log.warn("WARN: Auto-incrementing id to: " + oGamePayload.spielIndex);
        }

        var oSpiel = {
            "id": oGamePayload.spielIndex,
            "datum": oGamePayload.datum
        };

        if (oGamePayload.spielfrei) {
            oSpiel.spielfrei = oGamePayload.spielfrei
        } else {
            oSpiel.heim = oGamePayload.heim;
            oSpiel.gast = oGamePayload.gast;
        }

        this._oSpielplan[oGamePayload.liga][oGamePayload.runde]['spieltag_'+oGamePayload.spieltag].push(oSpiel);
        logger.log.debug("Added game to spielplan: " + oGamePayload);
    }

    increaseGameIndex(liga) {
        this._oSpielplan[liga].iCurrentGameIndex++;
        this._oSpielplan[liga].nextGameIndex = ligaHelper.getGameIndex(liga, this._oSpielplan[liga].iCurrentGameIndex);
        return this._oSpielplan[liga].nextGameIndex;
    }

    initialize() {
        for(var liga in this._oSpielplan) {
            for (var spieltag in this._oSpielplan[liga].vr) {
                this._oSpielplan[liga].vr[spieltag] = [];
            }
            for (var spieltag in this._oSpielplan[liga].rr) {
                this._oSpielplan[liga].rr[spieltag] = [];
            }
            this._oSpielplan[liga].iCurrentGameIndex = 1;
            this._oSpielplan[liga].nextGameIndex = ligaHelper.getGameIndex(liga, this._oSpielplan[liga].iCurrentGameIndex);
        }
    }

    getSpielplan() {
        return this._oSpielplan;
    }

    getGamesMap() {
        return this.oGamesMap;
    }

    getGamesMapStringified() {
        var ret = {};
        for (var game in this.oGamesMap) {
            ret[game] = JSON.stringify(this.oGamesMap[game]);
        }
        return ret;
    }


}


module.exports = Spielplan;