var router = require('express').Router();
var path = require('path');
var url = require('url');

var _ = require('lodash');
var viewPath = path.join( __dirname + "/");
var Logger = require( __configs + "loggingConfig");
var fs = require('fs');
var async = require('async');
var qs = require('querystring');

var validator = require('validator');
var sanitization = require(__configs + "sanitization");

var instructorDB = require(__components + "Instructor/instructorDB.js");

module.exports = function( app ) {

    /**
     * This functions checks a user's role to identify if they're an instructor.
     * Only appplies to pages /instructor/*, so the rest of the time you'll be a normal user.
     * @param  {[type]}   req  [description]
     * @param  {[type]}   res  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    function isInstr(req, res, next) {
        var user = _.get(req, "session.passport.user",req.user);
        if (req && req.user) {
            instructorDB.getRole(req.user.id, function(err, role) {
                if (role && role.length > 0){
                    if(role[0].value == "instructor")
                        next();
                    else
                        res.sendStatus(400);
                }
                else {
                    res.sendStatus(400);
                }
            });
        }
        else {
            res.redirect('/login');
        }
    }

    /**
     * Checks to see if a option is enabled for a certain course.
     * @param  integer   optionId  The option id.
     * @param  array     choices   The choices.
     * @return {[type]}        [description]
     */
    function checkEnabled(optionId, choices){
        for (var i = 0; i < choices.length; i++){
            if(optionId == choices[i].optionId)
                return 1;  
        }
        return 0;
    }

    function skillInsert(skills, classId, assignmentId){
        for(var i = 0; i < skills.length; i++){
            var data = [classId, assignmentId, skills[i]];
            instructorDB.insertSkill(skills[i], function(err) {});
            instructorDB.insertClassSkill(data, function(err) {});
        } 
    }

    function parseSkills(s, callback){
        instructorDB.getSkills(function (err, results){
            var skills = [];
            if (!err && results){
                for (var i = 0; i < results.length; i++){
                    var skill = {};
                    skill.s = results[i].name;
                    skill.enabled = 0;
                    for (var j = 0; j < s.length; j++){
                        if(results[i].id == s[j].id)
                        {
                            skill.enabled = 1;
                            break;
                        }
                    }
                    skills.push(skill);
                }
            }
            callback(undefined, skills);
        });
    }

    app.all('/instructor*', isInstr );

    app.route('/instructor')
    .get(function(req,res) {
        var classes = {}, assignments = {}, stats = {}, aoptions={}, coptions={}, tips={}, skills = {};

        async.parallel([
            async.apply(instructorDB.getClasses, req.user.id),
            async.apply(instructorDB.getAssignments, req.user.id),
            async.apply(instructorDB.fetchAssignmentOptions, "", true),
            async.apply(instructorDB.fetchClassOptions, "", true),
            instructorDB.getRandomTip,
            instructorDB.getSkills,
            async.apply(instructorDB.countInstStudents, req.user.id),
            async.apply(instructorDB.countInstStudentsOTW, req.user.id),
            async.apply(instructorDB.countWeeklySubmission, req.user.id),
            
        ], 
        function(err, results) {
            if (results){
                for (var i = 0; i < results.length; i++){
                    if(results[i]){
                        switch(i) {
                            case 0:
                                classes = results[i]; // set classes
                                break;
                            case 1:
                                assignments = results[i]; // set assignments
                                break;
                            case 2:
                                aoptions = results[i]; // set assignment options
                                break;
                            case 3:
                                coptions = results[i]; // set class options
                                break;
                            case 4:
                                tips = results[i]; // set tips
                                break;
                            case 5:
                                skills = results[i];
                                break;
                            default:
                                _.extend(stats, results[i][0]); // get statistics
                        }
                    }
                }
            }
            res.render(viewPath + "instructor", { title: 'Instructor Panel', classes: classes, assignments: assignments,
                       stats: stats, aoptions: aoptions, coptions: coptions, tips: tips[0], skills: skills});
        });

    });

    app.route('/instructor')
    .post(function(req,res,next){
        var data = qs.parse(req.body.formData);
        if (!Array.isArray(data.askills)) data.askills = [data.askills];
        if (req.body.form == 'createCourse'){
            var arr = [data.ccode, data.cname, data.desc, data.ctype, 
                       req.user.id, data.cyear, data.csemester];
            instructorDB.insertCourse(arr, function(err, queryInfo){
                if(!err){
                    skillInsert(data.cskills, queryInfo.insertId, -1);
                    res.sendStatus(200);
                }
                else
                    res.status(500).send();
            });
        }
        else if (req.body.form == 'createAss'){
            var courseInfo = JSON.parse(data.cnameA);
            var arr = [courseInfo.cid, data.aname, data.atitle, data.adesc, data.adate];
            instructorDB.insertAssignment(arr, function(err, queryInfo){
                if(!err){
                    skillInsert(data.askills, courseInfo.cid, queryInfo.insertId);
                    res.sendStatus(200);
                }
                else
                    res.status(500).send();
            });
        }
    });

    /********************************
     ** The manage assignment page  -- sorry this happened **
     ********************************/
    app.route('/instructor-manage-assignment')
    .post(function(req,res,next){
        var id = req.body['assignment-id'];

        instructorDB.checkAssignmentAccess(id, req.user.id, function(err, result){
            // make a check in case it fails and display some other page????
            if(!err && result){
                // lets check to make sure they have permission. prevents against
                // client side scripting
                if(result[0].found == '1') {
                    instructorDB.getAssignment(id, function(err, assignment){ // get the assignment its safer than passing all that data
                        if(!err && assignment){
                            var assign = assignment[0];
                            assign.deadline = assign.deadline.toLocaleDateString();
                            instructorDB.getAssignmentSkills(id, function(err, skills){
                                if(!err && skills){
                                    parseSkills(skills, function(err, s){
                                        if (!err && s) skills = s;
                                    });
                                    instructorDB.getAssignmentDiscipline(id, function(err, disResult){
                                        if(!err && disResult){
                                            instructorDB.fetchAssignmentOptions(disResult[0].discipline, false, function(err, options){
                                                if (!err && options){
                                                    instructorDB.getAssignmentChoices(id, function(err, choices){
                                                        if (!err && choices){
                                                            for (var i = 0; i < options.length; i++)
                                                                options[i].enabled = checkEnabled(options[i].id, choices);
                                                            res.render(viewPath + "instructorAssignment", {title: 'Assignment management',
                                                            aid: id, aname: assign.name, atitle: assign.title, adescription: assign.description, 
                                                            adeadline: assign.deadline, aoptions: options, askills: skills});
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
                                else {
                                    res.sendStatus(400);
                                }
                            });
                        }
                        else{
                            res.sendStatus(400);
                        }
                    });
                }
                else{ // no permission get them out of here
                    res.sendStatus(400);
                }
            }
            else {
                res.sendStatus(400);
            }
        });


    });


    /*********************************
     *** The course dashboard page ***
     *********************************/
    app.route('/instructor-course-dash')
    .post(function(req, res, next){
        var id = req.body['class-id'];
        instructorDB.checkClassAccess(id, req.user.id, function(err, result){
            console.log(result);
            if(!err && result){
                if(result[0].found == "1"){ // lets fetch the actual class to make sure there was no tampering           
                    instructorDB.getClass(id, function(error,course){ // get the class information its safer to just get by id
                        if (!error && course){
                            var cs = course[0];
                            console.log(cs.name);
                        }
                    });
                }
                else { // no access get them out of here
                    res.sendStatus(400)
                }
            }
        });

        res.render(viewPath + "instructorCourse", {title: 'Course Dashboard'});
    });

};