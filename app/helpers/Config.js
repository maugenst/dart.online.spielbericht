/**
 * The Config helper could be used in-place of the default "config" module for default tasks.
 * It improves error handling in the failure case.
 */
'use strict';
var util = require('util');
var _ = require('lodash');
var config = require('config');

/**
 * like the default config.get, but sends verbose debug information to the console, if the path in the config
 * was not found.
 *
 * @param configPath
 * @returns {value}
 */
var getWithVerboseError = function(configPath) {
    try {
        return config.get(configPath);
    } catch (e) {
        console.log(e);
        console.log(util.format("config main entries are: %s", _.keys(config)));
        console.log(util.format("config sources (global, also for testing) are: %s", JSON.stringify(_.map(config.util.getConfigSources(), x => {return x.name;}), null, '  ')));
        throw e;
    }
};

module.exports = {
    get: getWithVerboseError
};