'use strict';

class PdfTable {

    constructor() {
        this.table = {
            style: 'table',
            table: {
                headerRows: 1,
                body: []
            },
            layout: 'lightHorizontalLines'
        };
    }

    setTableHeader(aHeaders) {
        var aHeadline = [];
        for(var i in aHeaders) {
            aHeadline.push({ text: aHeaders[i], style: 'tableHeader', alignment: 'center' });
        }
        if (this.table.table.body.length === 0) {
            this.table.table.body.push(aHeadline);
        } else {
            this.table.table.body[0] = aHeadline;
        }
    }

    addRow(aCells) {
        if (this.table.table.body.length === 0) {
            var aHdr = [];
            for (var i = 0; i<aCells.length; i++) {
                aHdr.push("");
            }
            this.setTableHeader(aHdr);
        }
        var aRow = [];
        for(var i in aCells) {
            aRow.push({text:aCells[i], style: 'tablebody'});
        }
        this.table.table.body.push(aRow);
    }

    getContent() {
        return this.table;
    }
}

module.exports = PdfTable;
