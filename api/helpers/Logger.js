'use strict';

var log4js = require("log4js");
var fs = require('fs');
var path = require('path');
var config = require('config');

log4js.configure({
    appenders: {
        console: {
            type: "console",
            layout: {
                type: "pattern",
                pattern: "%m"
            },
        },
        bedelos: {
            type: "file",
            filename: "data/log/bedelos.out",
            maxLogSize: 10000000,
            backups: 3
        }
    },
    categories: {
        default: {
            appenders: ['console'],
            level: 'info'
        },
        bedelos: {
            appenders: ['bedelos'],
            level: 'info'
        }
    }
});

var _logDirectory = config.get("log.dir");

var _defaultLogFile = path.resolve(_logDirectory, "bedelos.out");

if (!fs.existsSync(_logDirectory)){
    fs.mkdirSync(_logDirectory);
    fs.closeSync(fs.openSync(_defaultLogFile, 'w'));
}

module.exports = {
    log : log4js.getLogger("bedelos"),
    console : log4js.getLogger("console"),
    logDirectory: _logDirectory,
    logFile : _defaultLogFile
};