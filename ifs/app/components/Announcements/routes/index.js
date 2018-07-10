const path = require('path');
const componentPath = path.join(__components,"Announcements");
const Announce = require(path.join(componentPath, '/controllers/announceController.js'));

module.exports = (app, iosocket) => {

 app.get('/announcements', Announce.getAnnounces);
 
};