var router = require('express').Router();
var path = require('path');
var url = require('url');

var _ = require('lodash');
var viewPath = path.join( __dirname + "/");
var Logger = require( __configs + "loggingConfig");
var fs = require('fs');
var async = require('async');

var validator = require('validator');
var sanitization = require(__configs + "sanitization");

var instructorDB = require(__components + "Instructor/instructorDB.js");

module.exports = function( app ) {

    /*
        Simple function to make sure that the user is an instructor
    */
    function isInstr(req, res, next) {
        var user = _.get(req, "session.passport.user",req.user);
        if (req && req.user) {
            if (user.instr) {
                next();
            } else {
                res.sendStatus(400);
            }
        }
        else {
            res.redirect('/login');
        }
    }

    function checkEnabled(optionId, choices){
        for (var i = 0; i < choices.length; i++){
            if(optionId == choices[i].optionId)
                return 1;  
        }
        return 0;
    }

    app.all('/instructor*', isInstr );

    app.route('/instructor')
    .get(function(req,res) {
        var classes = {}, assignments = {}, stats = {};

        async.parallel([
            async.apply(instructorDB.getClasses, req.user.id),
            async.apply(instructorDB.getAssignments, req.user.id),
            async.apply(instructorDB.countInstStudents, req.user.id),
            async.apply(instructorDB.countInstStudentsOTW, req.user.id),
            async.apply(instructorDB.countWeeklySubmission, req.user.id)
        ], 
        function(err, results) {
            if (results){
                for (var i = 0; i < results.length; i++){
                    if(results[i]){
                        switch(i) {
                            case 0:
                                classes = results[i];
                                break;
                            case 1:
                                assignments = results[i];
                                break;
                            default:
                                _.extend(stats, results[i][0]);
                        }
                    }
                }
            }
            res.render(viewPath + "instructor", { title: 'Instructor Panel', classes: classes, assignments: assignments,  stats: stats});
        });

    });

    app.route('/instructor-manage-assignment')
    .get(function(req,res){

    })
    .post(function(req,res,next){
        var id = req.body['assignment-id'];
        var name = req.body['assignment-name'];
        var title = req.body['assignment-title'];
        var description = req.body['assignment-description'];
        var deadline = req.body['assignment-deadline'];

        instructorDB.checkAssignmentAccess(id, req.user.id, function(err, result){
            // make a check in case it fails and display some other page????
            if(!err && result){
                // lets check to make sure they have permission. prevents against
                // client side scripting
                if(result[0].found == '1') {
                    instructorDB.getAssignmentDiscipline(id, function(err, disResult){
                        if(!err && disResult){
                            instructorDB.fetchAssignmentOptions(disResult[0].discipline, function(err, options){
                                if (!err && options){
                                    instructorDB.getAssignmentChoices(id, function(err, choices){
                                        if (!err && choices){
                                            for (var i = 0; i < options.length; i++)
                                                options[i].enabled = checkEnabled(options[i].id, choices);
                                            res.render(viewPath + "instructorAssignment", {title: 'Assignment management',
                                            aid: id, aname: name, atitle: title, adescription: description, adeadline: deadline,
                                            aoptions: options});
                                        }
                                        else{
                                            res.sendStatus(400);
                                        }
                                    });
                                }
                                else{ // once again something we need went wrong lets give them an error :p
                                    res.sendStatus(400);
                                }
                            });
                        }
                        else { // something is wrong lets just give them an error
                            res.sendStatus(400);
                        }
                    });
                }
                else{ // no permission get them out of here
                    res.sendStatus(400);
                }
            }
        });


    });



    app.route('/instructor-course-stats')
    .get(function(req, res) {
    });

};