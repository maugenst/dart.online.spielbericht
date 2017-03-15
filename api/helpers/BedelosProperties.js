'use strict';

const config = require('config');
const _ = require('lodash');

const aReadProperties = [
    {
        name: 'server.id',
        description: 'Unique Server Id',
        type: 'string',
        required: false
    }, {
        name: 'server.secret',
        description: 'Enter secret for CSM encryption',
        type: 'string',
        required: false
    }
];

const getByKey = function (sKey){
    return _.map(aReadProperties, sKey);
};
const getAll = function (oDefault) {
    if (oDefault) {
        _.each(aReadProperties, oProp => {
            if (_.has(oDefault, oProp.name)) {
                oProp['default'] = _.get(oDefault, oProp.name);
            }
        });
    }
    return aReadProperties;
};

/**
 * Validates configuration of the application.
 */
const validateConfiguration = function() {
    try {
        _.each(aReadProperties, (property) => {
            if (!config.has(property.name)) {
                throw new Error(`Server configuration does not have an entry for '${property.name}'.`);
            }
        });
    } catch (error) {
        let message = `${error}\n` +
            "  Configuration sources used:\n" +
            `${_.join(_.map(config.util.getConfigSources(), s => '  - ' + s.name), "\n")}\n` +
            "  (Hint: Call 'node configure.js' to create/update the internal database.)";
        console.error(message);
        throw error;
    }
};

module.exports = {
    getAll: getAll,
    getByKey: getByKey,
    validateConfiguration: validateConfiguration
};
