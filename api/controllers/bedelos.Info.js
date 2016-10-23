'use strict';

var util = require('util');
var os = require('os');
var logger = require('../helpers/Logger');

function listInfo (req, res) {
    try {
        var sHtmlInfo = "<html>\n" +
            "   <head>" +
            "       <title>BeDeLOS Server Status</title>\n" +
            "   </head>\n" +
            "   <body style='font-family: Arial'>\n" +
            "       <h1><img src='/images/bdl-headericon.png' width='50px'> - Server status overview</h1>\n" +
            "       <table>" +
            "           <tr style='vertical-align: top'><td colspan='2'><h2>Host</h2></td></tr>\n" +
            "           <tr style='vertical-align: top'><td>Hostname:</td><td>%s</td></tr>\n" +
            "           <tr style='vertical-align: top'><td>OS Type:</td><td>%s</td></tr>\n" +
            "           <tr style='vertical-align: top'><td>NodeJS:</td><td>%s</td></tr>\n" +
                // horizontal Ruler
            "       </table>" +
            "   </body>\n" +
            "</html>\n";


        sHtmlInfo = util.format(sHtmlInfo, os.hostname(), os.type(), process.version);
        res.status(200).send(sHtmlInfo);
    } catch (error) {
        res.send(500, "Error: " + error.stack.replace('/\n/g', '<br>'));

        logger.log.debug(error.stack);
    }
}

module.exports = {
    get: listInfo
};

