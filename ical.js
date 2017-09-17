const ical = require('ical-generator');
const fs = require('fs-extra');

cal = ical({
    domain: 'badischedartliga.de',
    prodId: '//badischedartliga.de//ical-generator//DE',
    events: [
        {
            start: new Date(),
            end: new Date(new Date().getTime() + 3600000),
            timestamp: new Date(),
            summary: 'My Event',
            organizer: 'Dart Plumbata Remus <luckymelka@gmx.de>'
        },
        {
            start: new Date(),
            end: new Date(new Date().getTime() + 3600000),
            timestamp: new Date(),
            summary: 'My Event',
            organizer: 'Dart Plumbata Remus <luckymelka@gmx.de>'
        }
    ]
}).toString();

console.log(cal);

