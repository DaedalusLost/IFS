var path = require('path');
var viewPath = path.join( __dirname + "/");
var fs = require("fs");

module.exports = function (app) {

    /* Solution #2 for connecting Express and Angular makes a 2nd route called data to http req*/
    app.get('/tool/data', function(req,res) {
        var supportedToolsFile = './tools/toolList.json';
        fs.readFile( supportedToolsFile, 'utf-8'    , function( err, data ) {
            if( err ) {
                //Unable to get support tools file, larger problem here.
                console.log(err);
            }
            else {
                //Load JSON tool file and send back to UI to create inputs
                var jsonObj = JSON.parse(data);
                res.json(jsonObj['tools']);
            }
        });
    });

    app.get('/tool', function( req, res , next ) {
        res.render( viewPath + "tool", { title: 'Tool Screen' } );
    });
}