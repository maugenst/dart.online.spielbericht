'use strict';

const crypt = require('./api/helpers/Crypt');
const config = require('config');
const prompt = require('prompt');
const path = require('path');
const jsonfile = require('jsonfile');
jsonfile.spaces = 4;

let user = config.get('bedelos.adminuser');

if (process.argv[2]) {
    user = process.argv[2];
    if (user !== config.get('bedelos.adminuser') && user !== config.get('bedelos.superuser')) {
        console.log(`Error: Invalid Username.`);
        process.exit(1);
    }
    prompt.start();

    prompt.get(
        [
            {
                name: 'secret',
                description: `Enter password for admin-user '${user}'`,
                type: 'string',
                hidden: true,
                replace: '*',
                required: true
            }
        ],
        function(err, result) {
            if (err) {
                return;
            }
            const sConfigFile = path.resolve(config.get('bedelos.configpath') + '/config.json');
            const oConfig = jsonfile.readFileSync(sConfigFile);
            crypt.setSecret(oConfig.secret);
            oConfig[user] = {};
            oConfig[user].password = {
                value: crypt.encrypt(result.secret),
                changeDate: Date.now()
            };
            jsonfile.writeFileSync(sConfigFile, oConfig, {spaces: 4});
            console.log('Successfully stored password for admin user.');
        }
    );
} else {
    console.log(`Error: Provide a username. [${config.get('bedelos.adminuser')} || ${config.get('bedelos.superuser')}]`);
    process.exit(1);
}
