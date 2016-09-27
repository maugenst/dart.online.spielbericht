'use strict';
var config = require('config');
var path = require('path');
var PdfPrinter = require('pdfmake/src/printer');

class PdfPage {

    constructor() {
        var fonts = {
            Roboto: {
                normal: path.resolve(config.get("fonts.dir") + '/Roboto-Regular.ttf'),
                bold: path.resolve(config.get("fonts.dir") + '/Roboto-Medium.ttf'),
                italics: path.resolve(config.get("fonts.dir") + '/Roboto-Italic.ttf'),
                bolditalics: path.resolve(config.get("fonts.dir") + '/Roboto-Italic.ttf')
            }
        };

        this.printer = new PdfPrinter(fonts);

        this.dd = {
            content: [],
            styles: {
                h1: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10]
                },
                h2: {
                    fontSize: 16,
                    bold: true,
                    margin: [0, 10, 0, 5]
                },
                h3: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 10, 0, 5]
                },
                table: {
                    margin: [0, 5, 0, 15]
                },
                tableHeader: {
                    bold: true,
                    fontSize: 8,
                    color: 'black',
                    fillColor: '#AFD3E0'
                },
                cell: {
                    fontSize: 8,
                    color: 'black'
                },
                center: {
                    alignment: 'center'
                },
                tdodd: {
                    fillColor: '#e4faff'
                },
                tdeven: {
                    fillColor: '#ffffff'
                }
            }
        };
    }

    addHeadlineH1(sHeadline) {
        this.dd.content.push({ text: sHeadline, style: 'h1' });
    }

    addHeadlineH2(sHeadline) {
        this.dd.content.push({ text: sHeadline, style: 'h2' });
    }

    addHeadlineH3(sHeadline) {
        this.dd.content.push({ text: sHeadline, style: 'h3' });
    }

    addTable(oTablecontent) {
        this.dd.content.push(oTablecontent);
    }

    getContent() {
        return this.dd;
    }

    generateDocument() {
        return this.printer.createPdfKitDocument(this.getContent());
    }
}

module.exports = PdfPage;
