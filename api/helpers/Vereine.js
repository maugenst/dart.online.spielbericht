'use strict';

/**
 * Created by D032233 on 27.06.2016.
 */

let path = require('path');
let config = require('config');
let _ = require('lodash');

class Vereine {

    static getTeamIDsFor(id) {
        if (!id.startsWith('v')) {
            return [id];
        }
        let sPath = path.resolve(config.get("bedelos.datapath"));
        let oTeams = require(sPath + '/Teams.json');
        let oVereine = require(sPath + '/Vereine.json');

        let aTeamIds = _.flatMap(_.filter(oTeams, (team, teamId) => {
            team.id = teamId;
            return (team.verein === id);
        }), (team) => {
            return team.id;
        });


        return aTeamIds;
    }
    
}

module.exports = Vereine;
