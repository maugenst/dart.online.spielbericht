'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var pug = require('pug');
var jsonfile = require('jsonfile');
jsonfile.spaces = 4;
var walker = require('walker');
var tabelle = require('../helpers/Tabelle');
var ligaHelper = require('../helpers/Liga');
var logger = require('../helpers/Logger');
var session = require('../helpers/Session');

function rescanAllTables (req, res) {
    try {
        var username = session.getUsername(req.cookies.BDL_SESSION_TOKEN);

        if (username !== config.get("bedelos.adminuser")) {
            throw new Error("You are not allowed to call this function.");
        }

        var sPath = path.resolve(config.get("bedelos.datapath"));
        var sResultsPath = path.resolve(config.get("bedelos.datapath") + '/ergebnisse/');
        var sTablesPath = path.resolve(config.get("bedelos.datapath") + '/tabellen/');
        var liga = req.swagger.params.liga.raw;

        // Reset Table(s) and Scan all necessary results
        if (liga === 'all') {
            let aLigen = Object.keys(config.get('bedelos.ligen'));
            aLigen.forEach(sLiga => {
                jsonfile.writeFileSync(path.resolve(sTablesPath + `/${sLiga}.json`), {});
            });
        } else {
            jsonfile.writeFileSync(path.resolve(sTablesPath + '/' + liga + '.json'), {});
        }
        
        var aProcessedFiles = [];

        walker(sResultsPath).on('file', function(file, stat) {
            if (ligaHelper.isUpdateNeeded(file, req.swagger.params.liga.raw)) {
                var oCurrentResults = jsonfile.readFileSync(file);
                var liga = ligaHelper.calcLigaFromFilename(file);
                tabelle.update({
                    currentResults: oCurrentResults,
                    liga: liga,
                    pathToTablesFiles: sTablesPath
                });
                aProcessedFiles.push(file);
            }
        }).on('end', function() {
            var html = pug.renderFile("api/views/updates.jade", {
                processedFiles: aProcessedFiles
            });

            res.status(200).send(html);
        });

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: rescanAllTables
};
