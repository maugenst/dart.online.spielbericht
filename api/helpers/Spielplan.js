'use strict';

/**
 * Created by D032233 on 27.06.2016.
 */

let _ = require('lodash');
let config = require('config');
let ligaHelper = require('./Liga');
let logger = require('./Logger');

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
        this.oTeamMap = {};
        for (let liga in this._oSpielplan) {
            for (let runde in this._oSpielplan[liga]) {
                if (runde === 'rr' || runde === 'vr') {
                    for (let spieltag in this._oSpielplan[liga][runde]) {
                        for (let i = 0; i<this._oSpielplan[liga][runde][spieltag].length; i++) {
                            let spiel = this._oSpielplan[liga][runde][spieltag][i];
                            if (this.oGamesMap[spiel.id]) {
                                logger.log.warn("WARN: Found double ID in spielplan: " + spiel.id);
                            }
                            if (!this._oTeams[spiel.heim] && !spiel.spielfrei) {
                                logger.log.warn("WARN: No team found: " + spiel.heim);
                                break;
                            }
                            if (!this._oTeams[spiel.gast] && !spiel.spielfrei) {
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
                            if (!this.oTeamMap[spiel.heim]) {
                                this.oTeamMap[spiel.heim] = liga;
                            }
                        }
                    }
                }
            }
        }
    }

    getFullGameInfo(sGameID) {
        let ret = {};
        let liga = ligaHelper.calcLigaFromString(sGameID);
        for (let spieltag in this._oSpielplan[liga].vr) {
            for (let i = 0; this._oSpielplan[liga].vr[spieltag].length; i++) {
                let spiel = this._oSpielplan[liga].vr[spieltag][i];
                if (spiel.id === sGameID) {
                    ret = spiel;
                    ret.liga = liga;
                    ret.spieltag = spieltag;
                    ret.runde = 'vr';
                    return ret;
                }
            }
        }
        for (let spieltag in this._oSpielplan[liga].rr) {
            for (let i = 0; this._oSpielplan[liga].rr[spieltag].length; i++) {
                let spiel = this._oSpielplan[liga].rr[spieltag][i];
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

    switchTeams(sGameID) {
        let oRet = {
            liga:'',
            runde:''
        };
        let liga = ligaHelper.calcLigaFromString(sGameID);
        oRet.liga = liga;
        _.forEach(this._oSpielplan[liga].vr, spieltag => {
            _.forEach(spieltag, (spiel, i) => {
                if (spiel && spiel.heim && spiel.heimName && spiel.gast && spiel.gastName && spiel.id && spiel.id === sGameID) {
                    const newGame = {
                        "id": sGameID,
                        "datum": spiel.datum,
                        "heim": spiel.gast,
                        "gast": spiel.heim,
                        "liga": spiel.liga,
                        "spieltag": spiel.spieltag,
                        "runde": spiel.runde,
                        "heimName": spiel.gastName,
                        "gastName": spiel.heimName
                    };
                    _.set(this._oSpielplan, `${liga}.vr[${spiel.spieltag}][${i}]`, newGame);
                    oRet.runde = spiel.runde;
                    return oRet;
                }
            });
        });
        _.forEach(this._oSpielplan[liga].rr, spieltag => {
            _.forEach(spieltag, (spiel, i) => {
                if (spiel && spiel.heim && spiel.heimName && spiel.gast && spiel.gastName && spiel.id && spiel.id === sGameID) {
                    const newGame = {
                        "id": sGameID,
                        "datum": spiel.datum,
                        "heim": spiel.gast,
                        "gast": spiel.heim,
                        "liga": spiel.liga,
                        "spieltag": spiel.spieltag,
                        "runde": spiel.runde,
                        "heimName": spiel.gastName,
                        "gastName": spiel.heimName
                    };
                    _.set(this._oSpielplan, `${liga}.rr[${spiel.spieltag}][${i}]`, newGame);
                    oRet.runde = spiel.runde;
                    return oRet;
                }
            });
        });
        return oRet;
    }

    removeGame(sGameID) {
        let liga = ligaHelper.calcLigaFromString(sGameID);
        for (let spieltag in this._oSpielplan[liga].vr) {
            for (let i = 0; i<this._oSpielplan[liga].vr[spieltag].length; i++) {
                let spiel = this._oSpielplan[liga].vr[spieltag][i];
                if (spiel.id === sGameID) {
                    this._oSpielplan[liga].vr[spieltag].splice(i, 1);
                }
            }
        }
        for (let spieltag in this._oSpielplan[liga].rr) {
            for (let i = 0; i<this._oSpielplan[liga].rr[spieltag].length; i++) {
                let spiel = this._oSpielplan[liga].rr[spieltag][i];
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

        let oSpiel = {
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
        let oLigen = config.get('bedelos.ligen');
        this._oSpielplan = {};

        for (let liga in oLigen) {
            this._oSpielplan[liga] = {
                name: oLigen[liga].name,
                vr: {},
                rr: {},
                iCurrentGameIndex: 1,
                nextGameIndex: `${oLigen[liga].prefix}001`
            };
            let i = 1;
            for (i; i<=oLigen[liga].spieltage/2; i++) {
                this._oSpielplan[liga].vr[`spieltag_${i}`] = []
            }
            for (i; i<=oLigen[liga].spieltage; i++) {
                this._oSpielplan[liga].rr[`spieltag_${i}`] = []
            }
        }
    }

    getSpielplan() {
        return this._oSpielplan;
    }

    getGamesMap() {
        return this.oGamesMap;
    }

    getLigaFor(teamId) {
        return this.oTeamMap[teamId];
    }

    getFilteredGamesMap(oFilter) {
        return _.filter(this.oGamesMap, oFilter);
    }

    getGamesMapStringified() {
        let ret = {};
        for (let game in this.oGamesMap) {
            ret[game] = JSON.stringify(this.oGamesMap[game]);
        }
        return ret;
    }


}


module.exports = Spielplan;