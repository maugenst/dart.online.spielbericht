'use strict';

var UID = {

    _usedUIDs: {},

    generate: function (bLongUID) {
        var uid = this._newUID(bLongUID);
        while (this._usedUIDs[uid]) {
            uid = this._newUID();
        }
        this._usedUIDs[uid] = {};
        return uid;
    },

    _newUID: function (long) {
        var sUID = "";
        if (long) {
            sUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        } else {
            sUID = this._uppercaseSome(("000000" + (Math.random() * Math.pow(36, 6) << 0).toString(36)).slice(-6));
        }
        return sUID;
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