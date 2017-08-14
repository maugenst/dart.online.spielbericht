'use strict';

var prompt = require('prompt');
var path = require('path');
var jsonfile = require('jsonfile');
var crypt = require('./api/helpers/Crypt');
var config = require('config');

jsonfile.spaces = 4;

var sUsername = process.argv[2]

prompt.start();

prompt.get([{
    name: 'secret',
    description: `Enter password for user '${sUsername}'`,
    type: 'string',
    hidden: true,
    replace: '*',
    required: true
}], function (err, result) {
    if (err) {
        return;
    }
    crypt.setSecret(jsonfile.readFileSync(path.resolve(config.get("bedelos.configpath") + "/config.json")).secret);

    if (sUsername.startsWith('bdl')) {
        var sUserStoreFile = path.resolve(config.get("bedelos.datapath") + "/Teams.json");
        var oUserstore = jsonfile.readFileSync(sUserStoreFile);
        //console.log(sUserStoreFile);
        //console.log(oUserstore[sUsername]);
        oUserstore[sUsername].password.value = crypt.encrypt(result.secret);
        oUserstore[sUsername].password.changeDate = 0;
        //console.log(oUserstore[sUsername]);
        jsonfile.writeFileSync(sUserStoreFile, oUserstore);
    } else {
        var sUserStoreFile = path.resolve("data/config/userStore.json");
        var oUserstore = jsonfile.readFileSync(sUserStoreFile);
        console.log(sUserStoreFile);
        console.log(oUserstore[sUsername]);
        oUserstore[sUsername] = crypt.encrypt(result.secret);
        jsonfile.writeFileSync(sUserStoreFile, oUserstore);
    }

});

