'use strict';

/**
 * Created by d032233 on 29.12.2016.
 */

const CsmError = require('../Error');
const BbPromise = require('bluebird');
const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');

class ZipFile {
    constructor(sFile = this.mandatory()) {
        this.filename = path.resolve(sFile);
        this.basename = path.basename(this.filename);
        this.zip = new JSZip();
        this.data = null;
    }

    add(oData) {
        this.zip.file(oData.filename, oData.content);
        return this;
    }

    base64() {
        return this.zip.generateAsync({type: 'base64'});
    }

    stream() {
        return this.zip.generateNodeStream({
            type: 'nodebuffer',
            streamFiles: true,
            compression: 'DEFLATE',
            compressionOptions: {
                level: 9
            }
        });
    }

    save() {
        const that = this;
        return new BbPromise(function(resolve, reject) {
            that
                .stream()
                .pipe(fs.createWriteStream(that.filename))
                .on('finish', function() {
                    resolve();
                })
                .on('error', function(e) {
                    reject(e);
                });
        });
    }

    mandatory() {
        throw new CsmError('Missing parameter');
    }
}

module.exports = ZipFile;
