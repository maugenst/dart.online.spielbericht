'use strict';

class Sessions {

    static add(token, oData) {
        if (!this.tokens) {
            this.tokens = {};
        }
        this.tokens[token] = oData || {};
    }

    static get(token) {
        if (!this.tokens) {
            this.tokens = {};
        }
        return this.tokens[token];
    }

    static getUsername(token) {
        if (!this.tokens) {
            this.tokens = {};
        }
        if (this.tokens[token] && this.tokens[token].username) {
            return this.tokens[token].username;
        } else {
            return undefined;
        }
    }

    static remove(token) {
        if (!this.tokens) {
            return;
        }
        delete this.tokens[token];
    }
}

module.exports = {
    add: Sessions.add,
    get: Sessions.get,
    getUsername: Sessions.getUsername,
    remove: Sessions.remove
};