var router = require('express').Router();
var path = require('path');
var _ = require('lodash');
var viewPath = path.join( __dirname + "/");
var Logger = require( __configs + "loggingConfig");
var fs = require('fs');

var adminDB = require(__components + "Admin/adminDB.js");

module.exports = function( app ) {

    /**
     * Simple redirect to set as admin page finalizes.
     * @param  {[type]} res [description]
     * @return {[type]}     [description]
     */
    function directTo(res, path) {
        if( !path )
            path = "/adminDashboard";

        res.location( path );
        res.redirect( path );
    }

    /**
     * Creates the get admin pages 
     * @param  {[type]}   req      Request obj
     * @param  {[type]}   res      Response Obj
     * @param  {[type]}   options  Page options
     * @param  {Function} callback Database callback(currently no options)
     * @return {[type]}            [description]
     */
    function getAdminRemove( req,res, options, callback ) {
         callback( function(err,data) {
            res.render(viewPath + options.removeForm, { title: options.title,
                page: {
                    displayName:options.displayName
                },
                values: data,
                formAction: options.formAction
            });
        });
    }

    /**
     * Create the post admin remove pages. Works for adminRemoveForm
     * @param  {[type]}   req      [description]
     * @param  {[type]}   res      [description]
     * @param  {[type]}   options  [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    function postAdminRemove(req,res, options, callback ) {
        var controlValues = req.body['adminControl'];
        controlValues = _.each(controlValues, x => parseInt(x) );
        console.log(controlValues);
        callback( controlValues,  function(err,data){
            if( err ) {
                req.flash('errorMessage', "Unable to remove " + options.removeType + " data is still linked to other student information");
                directTo(res,"/adminRemove" + options.removeType);
            } else {
                directTo(res);
            }
        });
    }

    /********************************** Remove Classes ******************************/

    app.route('/adminRemoveCourses')
    .get(function(req,res){
        getAdminRemove(req,res, {
                removeForm: 'adminRemoveForm',
                title: 'Admin Page',
                displayName:"Remove Courses",
                formAction: "/adminRemoveCourses"
            },
            adminDB.getAllClasses
        );
    })
    .post(function(req,res){
        postAdminRemove(req,res, { 
                removeType: "Courses"
            },
            adminDB.deleteCourses
        );
    });

    /********************************** Remove Events ******************************/
    app.route('/adminRemoveEvents')
    .get(function(req,res){
        getAdminRemove(req,res, {
                removeForm: 'adminRemoveForm',
                title: 'Admin Page',
                displayName:"Remove Event",
                formAction: "/adminRemoveEvents"
            },
            adminDB.getAllEvents
        );
    })
    .post(function(req,res){
        postAdminRemove(req,res, { 
                removeType: "Events"
            },
            adminDB.deleteEvents
        );
    });

    /********************************** Remove Skill ******************************/
    app.route('/adminRemoveSkills')
    .get(function(req,res){
        getAdminRemove(req,res, {
                removeForm: 'adminRemoveForm',
                title: 'Admin Page',
                displayName:"Remove Skill",
                formAction: "/adminRemoveSkills"
            },
            adminDB.getAllSkills
        );
    })
    .post(function(req,res){
        postAdminRemove(req,res, { 
                removeType: "Skills"
            },
            adminDB.deleteSkills
        );
    });

    /********************************** Remove Assignments ******************************/
    app.route('/adminRemoveAssignments')
    .get(function(req,res){
        getAdminRemove(req,res, {
                removeForm: 'adminRemoveForm',
                title: 'Admin Page',
                displayName:"Remove Assignments",
                formAction: "/adminRemoveAssignments"
            },
            adminDB.getAllAssignments
        );
    })
    .post(function(req,res){
        postAdminRemove(req,res, { 
                removeType: "Assignemts"
            },
            adminDB.deleteAssignments
        );
    });
};