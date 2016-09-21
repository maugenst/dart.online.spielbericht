'use strict';

class PdfPage {

    constructor() {
        this.dd = {
            content: [],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10]
                },
                subheader: {
                    fontSize: 16,
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
                tablebody: {
                    fontSize: 8,
                    color: 'black'
                }
            }
        };
    }

    addHeadline(sHeadline) {
        this.dd.content.push({ text: sHeadline, style: 'subheader' });
    }

    addTable(oTablecontent) {
        this.dd.content.push(oTablecontent);
    }

    getContent() {
        return this.dd;
    }
}

module.exports = PdfPage;
