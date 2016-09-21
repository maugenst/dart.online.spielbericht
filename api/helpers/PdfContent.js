'use strict';
/**
 * Created by d032233 on 24.03.2016.
 */

class PdfContent {

    constructor() {
        var dd = {
            content: [
                { text: '', style: 'subheader' },
                {
                    style: 'table',
                    table: {
                        headerRows: 1,
                        body: []
                    },
                    layout: 'lightHorizontalLines'
                }
            ],
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
            },
            defaultStyle: {
                // alignment: 'justify'
            }

        };
    }
}

