'use strict';
const JSZip = require('jszip');
const Docxtemplater = require('docxtemplater');
const mkdirp = require('mkdirp');

const fs = require('fs');
const path = require('path');
const config = require('config');
const Logo = require('../helpers/BDLLogo');
/**
 * Class Description
 */
class EhrentafelDocx {

    /**
     * Constructor
     * @param oData.Teamname (String)
     * @param oData.Liga (String)
     * @param oData.Saison1 (String)
     * @param oData.Saison2 (String)
     * @param oData.Platz (String)
     * @param oData.TeamID (String)
     * @param oData.spieler (Array)
     */
    constructor(oData) {
        //Load the docx file as a binary
        this.doc = new Docxtemplater();
        this.doc.loadZip(
            new JSZip(fs.readFileSync(path.resolve(__dirname, '../templates/docx/ehrentafeln.docx'), 'binary'))
        );
        this.data = oData || {
            Teamname: '',
            Liga: '',
            Saison1: '',
            Saison2: '',
            Platz: '',
            TeamID: '',
            spieler: []
        };
    }

    generate() {
        const outdir = path.resolve(`${__dirname}../../../data/docx/${this.data.Saison1}${this.data.Saison2}`);
        mkdirp.sync(outdir);
        const outfile = path.resolve(
            outdir,
            `Ehrentafel_${this.data.TeamID}_${this.data.Saison1}${this.data.Saison2}.docx`
        );
        this.doc.setData(this.data);

        try {
            this.doc.render();
        } catch (error) {
            throw error;
        }

        var buf = this.doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 9
            }
        });

        fs.writeFileSync(outfile, buf);
    }
}

module.exports = EhrentafelDocx;
