'use strict';
const _ = require('lodash');

class PdfTable {
    constructor(oConfig) {
        this.table = oConfig || {
            style: 'table',
            table: {
                headerRows: 1,
                body: []
            },
            layout: 'lightHorizontalLines'
        };
    }

    setWidths(aWidths) {
        this.table.table.widths = aWidths;
    }

    _getHeadlineArr(aLine) {
        var aHeadline = [];
        aLine.forEach(cell => {
            if (_.isObject(cell)) {
                aHeadline.push(_.assign({text: '...', style: 'tableHeader', alignment: 'center', noWrap: true}, cell));
            } else {
                aHeadline.push({text: cell, style: 'tableHeader', alignment: 'center', noWrap: true});
            }
        });
        return aHeadline;
    }

    setTableHeader(aHeaders) {
        if (_.isArray(aHeaders[0])) {
            // first adapt the header Rows parameter
            this.table.table.headerRows = aHeaders.length;
            // Iterate on all headerLines
            _.eachRight(aHeaders, aHeaderLine => {
                this.setTableHeader(aHeaderLine);
            });
        } else {
            this.table.table.body.unshift(this._getHeadlineArr(aHeaders));
        }
    }

    addRow(aCells) {
        if (this.table.table.body.length === 0 && this.table.table.headerRows && this.table.table.headerRows !== 0) {
            var aHdr = [];
            for (var i = 0; i < aCells.length; i++) {
                aHdr.push('');
            }
            this.setTableHeader(aHdr);
        }
        var aRow = [];
        for (var i in aCells) {
            var cell = aCells[i];
            if (typeof cell === 'object') {
                aRow.push(cell);
            } else {
                aRow.push({text: aCells[i] + '', style: 'cell'});
            }
        }
        this.table.table.body.push(aRow);
    }

    getContent() {
        return this.table;
    }
}

module.exports = PdfTable;
