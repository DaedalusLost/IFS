var path = require('path');
var viewPath = path.join( __dirname + "/");

var fs = require('fs');

module.exports = function( app ) {
    app.route("/preferences")

    .get( function(req,res,next){
        res.render( viewPath + "preferences", { title: 'Preferences', message:'ok'})
    })

    .post(function(req,res,next) {
        if( req.body ) {
            // TODO: Preferences aren't saved anywhere except this variable.
            // Partially because we don't have preferences yet
            // This will create a minor bug in that
            if( req.session) {
                req.session.toolSelect = req.body.toolSelect;
                req.session.toolFile = req.body.toolSelect == "Programming" ? './tools/toolListProgramming.json' :  './tools/toolList.json';
            }
        }

        //TODO pop or message
        res.location( "/tool");
        res.redirect( "/tool" );
    });

    app.get('/preference/data', function(req,res) {
        var preferencesFile = './users/preferencesList.json';
        fs.readFile( preferencesFile, 'utf-8', function( err, data ) {
            if( err ) {
                //Unable to get support tools file, larger problem here.
                Logger.error(err);
            }
            else {
                var jsonObj = JSON.parse(data);
                res.json(jsonObj['preferences']);
            }
        });
    });
}

