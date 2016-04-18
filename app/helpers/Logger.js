'use strict';

let log4js = require("log4js");
let fs = require('fs');
let path = require('path');
let config = require('./Config');

log4js.configure( "./config/log4js.json" );
let _logDirectory = config.get("log.dir");

let _defaultLogFile = path.resolve(_logDirectory, "bedelos.out");

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