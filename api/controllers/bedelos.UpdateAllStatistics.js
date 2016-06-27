'use strict';

var util = require('util');
var path = require('path');
var config = require('config');
var jsonfile = require('jsonfile');
jsonfile.spaces = 4;
var walker = require('walker');
var jade = require('jade');
var statistics = require('../helpers/Statistik');
var ligaHelper = require('../helpers/Liga');

function rescanAllStatistics (req, res) {
    try {
        var sPath = path.resolve(config.get("bedelos.datapath"));
        var sResultsPath = path.resolve(config.get("bedelos.datapath") + '/ergebnisse/');
        var sStatisticsPath = path.resolve(config.get("bedelos.datapath") + '/statistiken/');

        // Reset Tables and Scan all results
        jsonfile.writeFileSync(path.resolve(sStatisticsPath + '/bzLiga.json'), {});
        jsonfile.writeFileSync(path.resolve(sStatisticsPath + '/klnord.json'), {});
        jsonfile.writeFileSync(path.resolve(sStatisticsPath + '/klsued.json'), {});
        jsonfile.writeFileSync(path.resolve(sStatisticsPath + '/oberliga.json'), {});

        var aProcessedFiles = [];

        walker(sResultsPath).on('file', function(file, stat) {
            if (path.extname(file) === '.json') {
                var oCurrentResults = jsonfile.readFileSync(file);
                var liga = ligaHelper.calcLigaFromFilename(file);
                statistics.update({
                    currentResults: oCurrentResults,
                    liga: liga,
                    pathToStatisticsFiles: sStatisticsPath
                });
                aProcessedFiles.push(file);
            }
        }).on('end', function() {
            var html = jade.renderFile("api/views/updates.jade", {
                processedFiles: aProcessedFiles
            });

            res.status(200).send(html);
        });

    } catch (error) {
        res.status(500).send("Error: " + error.stack.replace('/\n/g', '<br>'));
    }
}

module.exports = {
    get: rescanAllStatistics
};
