'use strict';

var UID = {

    _usedUIDs: {},

    generate: function () {
        var uid = this._newUID();
        while (this._usedUIDs[uid]) {
            uid = this._newUID();
        }
        this._usedUIDs[uid] = {};
        return uid;
    },

    _newUID: function () {
        return this._uppercaseSome(("000000" + (Math.random() * Math.pow(36, 6) << 0).toString(36)).slice(-6));
    },

    _uppercaseSome: function (uid) {
        var aUID = uid.split('');
        for (var i = 0; i < aUID.length; i++) {
            if (isNaN(aUID[i]) && this._isLowercase(aUID[i])) {
                aUID[i] = (this._randomBoolean()) ? aUID[i].toUpperCase() : aUID[i];
            }
        }
        var ret = aUID.join('');
        return ret;
    },

    _isLowercase: function (char) {
        return (char.toUpperCase() !== char);
    },

    _randomBoolean: function () {
        return (Math.random() > 0.5);
    }
};

module.exports = UID;