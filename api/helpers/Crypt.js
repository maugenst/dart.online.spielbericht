'use strict';
/**
 * The Crypt helper provides encrypt/decrypt methods.
 */
var _ = require('lodash');
var crypto = require('crypto');

var _secret;
var algorithm = 'aes-256-cbc';

class Crypt {

    constructor() {
        this.secret = "";
        this.hash = function(string) {
            var shasum = crypto.createHash('sha512');
            shasum.update(string, 'utf8');
            return shasum.digest('hex');
        };
    }

    static setSecret(secret) {
        this._secret = secret;
    }

    static encrypt(message) {
        if (!this._secret) {
            throw new Error("Crypt not initialized. Was setSecret() called?");
        }
        var m = crypto.createHash('md5');
        m.update(this._secret);
        var key = m.digest('hex');

        m = crypto.createHash('md5');
        m.update(this._secret + key);
        var iv = m.digest('hex');

        var cipher = crypto.createCipheriv(algorithm, key, iv.slice(0, 16));

        var encrypted = cipher.update(message, 'utf8', 'binary') + cipher.final('binary');
        var ret = new Buffer(encrypted, 'binary').toString('base64');
        // Convert to urlsafe base64 compatibility reasons
        ret = ret.replace(/\+/g, '-').replace(/\//g, '_');
        return ret;
    }

    static decrypt (input) {
        var ciphertext = _.clone(input);
        if (!this._secret) {
            throw new Error("Crypt not initialized. Was setSecret() called?");
        }
        // Convert urlsafe base64 to normal base64
        ciphertext = ciphertext.replace(/\-/g, '+').replace(/_/g, '/');
        // Convert from base64 to binary string
        var data = new Buffer(ciphertext, 'base64').toString('binary');

        // Create key from password
        var m = crypto.createHash('md5');
        m.update(this._secret);
        var key = m.digest('hex');

        // Create iv from password and key
        m = crypto.createHash('md5');
        m.update(this._secret + key);
        var iv = m.digest('hex');

        // Decipher encrypted data
        var decipher = crypto.createDecipheriv(algorithm, key, iv.slice(0, 16));

        try {
            return (decipher.update(data, 'binary', 'utf8') + decipher.final('utf8'));
        } catch (err) {
            // in case of a decoding error, we return the original input
            return input;
        }
    }

}


module.exports = {
    setSecret: Crypt.setSecret,
    encrypt: Crypt.encrypt,
    decrypt: Crypt.decrypt
};