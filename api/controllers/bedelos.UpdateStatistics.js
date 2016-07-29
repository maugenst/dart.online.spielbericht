'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var pug = require('pug');
var jsonfile = require('jsonfile');
jsonfile.spaces = 4;
var walker = require('walker');
var statistics = require('../helpers/Statistik');
var ligaHelper = require('../helpers/Liga');
var logger = require('../helpers/Logger');
var session = require('../helpers/Session');

function rescanAllStatistics (req, res) {
    try {
        var username = session.getUsername(req.cookies.BDL_SESSION_TOKEN);

        if (username !== config.get("bedelos.adminuser")) {
            throw new Error("You are not allowed to call this function.");
        }

        var sPath = path.resolve(config.get("bedelos.datapath"));
        var sResultsPath = path.resolve(config.get("bedelos.datapath") + '/ergebnisse/');
        var sStatisticsPath = path.resolve(config.get("bedelos.datapath") + '/statistiken/');
        var liga = req.swagger.params.liga.raw;

        // Reset Table(s) and Scan all necessary results
        if (liga === 'all') {
            jsonfile.writeFileSync(path.resolve(sStatisticsPath + '/bzLiga.json'), {});
            jsonfile.writeFileSync(path.resolve(sStatisticsPath + '/klnord.json'), {});
            jsonfile.writeFileSync(path.resolve(sStatisticsPath + '/klsued.json'), {});
            jsonfile.writeFileSync(path.resolve(sStatisticsPath + '/oberliga.json'), {});
        } else {
            jsonfile.writeFileSync(path.resolve(sStatisticsPath + '/' + liga + '.json'), {});
        }

        var aProcessedFiles = [];

        walker(sResultsPath).on('file', function(file, stat) {
            if (ligaHelper.isUpdateNeeded(file, req.swagger.params.liga.raw)) {
                statistics.update({
                    currentResults: jsonfile.readFileSync(file),
                    liga: ligaHelper.calcLigaFromFilename(file),
                    pathToStatisticsFiles: sStatisticsPath
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
    get: rescanAllStatistics
};
