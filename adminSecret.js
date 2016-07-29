'use strict';

var crypt = require('./api/helpers/Crypt');
var config = require('config');
var prompt = require('prompt');
var path = require('path');
var jsonfile = require('jsonfile');
jsonfile.spaces = 4;

prompt.start();

prompt.get([{
    name: 'secret',
    description: `Enter password for admin user '${config.get("bedelos.adminuser")}'`,
    type: 'string',
    hidden: true,
    replace: '*',
    required: true
}], function (err, result) {
    if (err) {
        return;
    }
    var sConfigFile = path.resolve(config.get("bedelos.configpath") + "/config.json");
    var oConfig = jsonfile.readFileSync(sConfigFile);
    crypt.setSecret(oConfig.secret);
    oConfig[config.get("bedelos.adminuser")] = {};
    oConfig[config.get("bedelos.adminuser")].password = {
        value: crypt.encrypt(result.secret),
        changeDate: Date.now()
    }
    jsonfile.writeFileSync(sConfigFile, oConfig);
    console.log("Successfully stored password for admin user.");

});

