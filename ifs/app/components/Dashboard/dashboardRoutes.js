var path = require('path');
var viewPath = path.join( __dirname + "/");
var fs = require("fs");
var async = require('async');
var _ = require('lodash');

var Errors = require(__components + "Errors/errors");
var Logger = require( __configs + "loggingConfig");

var db = require( __configs + 'database');
var dbcfg = require(__configs + 'databaseConfig');
var dbHelpers = require(__components + "Databases/dbHelpers");

var studentProfile = require(__components + "StudentProfile/studentProfileDB");
var upcomingEvents = require(__components + "StudentProfile/upcomingEventsDB");
var studentSkill = require(__components + "StudentProfile/studentSkillDB");

var studentModel = require(__components + "StudentModel/studentModelDB");
var socialModel = require(__components + "SocialModel/socialStatsDB");

var feedbackModel = require(__components + "InteractionEvents/feedbackEvents");

var event = require(__components + "InteractionEvents/buildEvent.js" );
var tracker = require(__components + "InteractionEvents/trackEvents.js" );

let q1 = {
    title: 'Radio buttons example:',
    fields: [
        {type: 'radio', model: 'radioButtons', options: [
            {label: 'Option A', value: 'opA'},
            {label: 'Option B', value: 'opB'},
            {label: 'Option C', value: 'opC'}
        ]}
    ]
};

let q2 = {
    title: 'Checkboxes example:',
    fields: [
        {type: 'checkbox', options: [
            {label: 'Option A', model: 'opAmodel'},
            {label: 'Option B', model: 'opBmodel'},
            {label: 'Option C', model: 'opCmodel'}
        ]}
    ]
};

let q3 = {
    title: 'Multiple inputs example:',
    fields: [
        {type: 'select', model: 'selectField', label: 'Select', options: [{label: 'Option A'}, {label: 'Option B'}, {label: 'Option C'}]},
        {type: 'text', label: 'Label', placeholder: 'Placeholder', id: 'textID', model: ''}
    ]
};

var arr = [];

for (var i = 0; i < 9; i++) {
    if (i == 0 || i == 3 || i == 6)
        arr[i] = q1;
    if (i == 1 || i == 4 || i == 7)
        arr[i] = q2;
    if (i == 2 || i == 5 || i == 8)
        arr[i] = q3;
}

let counter = 0;

module.exports = function (app, iosocket )
{    /**
     * [focusOptions description]
     * @param  {[type]} assignmentData [description]
     * @return {[type]}                [description]
     */
    function getAssignments( assignmentData ) {
        var keys = ['assignmentId','assignmentName','courseId','description'];
        var assignments = _.map(assignmentData, obj =>_.pick(obj,keys) );
        assignments = _.uniqBy(assignments,'assignmentId');
        return assignments;
    }

    /**
     * Get suggestion object from required keys.
     * @param  {[type]} items [description]
     * @return {[type]}       [description]
     */
    function getSuggestion(items) {
        var sugKeys  = ['target','suggestions','value'];
        var suggestions = [];
        try {
            var stats = {};
            var suggestions =  _.map(items, function(obj) {
                var  t = _.pick(obj,sugKeys);
                var arr = JSON.parse( t.suggestions)
                t.suggestions = arr[0];
                return t;
            });
        }
        catch(e) {
        }
        return suggestions;
    }

    /**
     * Retrieves several statics at a time in parallel and organizes them for display.
     * @param  {[type]}   statsReq [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    function genericStatsRequest( statsReq, callback ) {

        var calls = _.map(statsReq,'request');
        async.parallel( calls, function(err,results) {

            // Match the length of parallel input.
            if(results && results.length == calls.length ) {

                var ret = {};
                for( var i = 0; i < calls.length; i++ ){
                    var r = results[i];
                    if(statsReq[i]['process'])
                        r = statsReq[i].process( r );

                    if( statsReq[i].displayName )
                        _.set(r, "displayName", statsReq[i].displayName);
                    
                    if(statsReq[i].resultPath)
                        _.set(ret, statsReq[i].resultPath, r);
                }
                callback(ret);
            }
            else
                callback([]);
        });
    }

    /**
     * This function retrieves writing stats from the database and prepares them for display on dashboard.
     *  Depending on the layout of the dashboard more stats can be retrieved via paralle method.
     * @param  {[type]}   req      [description]
     * @param  {[type]}   res      [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    function writingStats( req, res, callback ) {

        var toolSelect = req.session.toolSelect.toLowerCase();
        var topN = 3;
        var uid = req.user.id;
        var requests = [
            {
                'request': studentModel.getMyMostCommonSpellingMistakes.bind( null,uid, topN ),
                'process': getSuggestion,
                'resultPath': 'userStats.suggestions',
                'displayName': 'My Suggestions'
            },
            {
                'request': studentModel.getMySpellingAccuracy.bind( null,uid),
                'process': null,
                'resultPath': 'userStats.accuracy',
                'displayName': 'Spelling Accuracy'
            },
            {
                'request': socialModel.getMostCommonSpellingMistakes.bind( null, topN ),
                'process': getSuggestion,
                'resultPath': 'socialStats.suggestions',
                'displayName': 'Class Suggestions'
            },
            {
                'request': socialModel.getSpellingAccuracy,
                'process': null,
                'resultPath': 'socialStats.accuracy',
                'displayName': 'Class Accuracy'
            },

            {
                'request': studentModel.getMyMostUsedTools.bind( null,uid, toolSelect, topN ),
                'process': null,
                'resultPath': 'userStats.tools',
                'displayName': 'My Tools'
            },
            {
                'request': socialModel.getMostUsedTools.bind( null, toolSelect, topN ),
                'process': null,
                'resultPath': 'socialStats.tools',
                'displayName': 'Class Tools'
            }
        ];
        genericStatsRequest(requests,callback);
    }

    /**
     * Minimal function to process double wrapped arrays into single
     * @param  {[type]} arr [description]
     * @return {[type]}     [description]
     */
    function farr( arr ) {
        return arr && arr.length > 0 ? arr[0] : arr;
    }


    /**
     * Very specific function to make sure result is not set to array but to an object with arr as the value
     * So that other key/value pairs aren't integrated into the array
     * @param {[type]} arr [description]
     * @param {[type]} obj [description]
     */
    function setArrayAsValueInObject( arr ){
        return {'value': arr};
    }

    /**
     * Setup Programming dashboard stats
     * @param  {[type]}   req      [description]
     * @param  {[type]}   res      [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    function programmingStats( req, res, callback ) {

        var toolSelect = req.session.toolSelect.toLowerCase();
        var topN = 1;
        var id = req.user.id;

        var requests = [
            {
                'request': studentModel.getMyMostUsedTools.bind( null, id, toolSelect, topN ),
                'process': farr,
                'resultPath': 'userStats.mostUsedTools',
                'displayName': "Most Frequent Tool"
            },
            {
                'request': studentModel.getMyCommonFeedbackTool.bind(null, id, toolSelect, topN),
                'process': farr,
                'resultPath': 'userStats.mostFeedbackTools',
                'displayName': "Most Feedback from Tool"
            },
            {
                'request': studentModel.getMyCommonViewedMoreFeedbackTool.bind(null,id, toolSelect, topN ),
                'process': farr,
                'resultPath': 'userStats.mostViewedMoreFeedbackTool',
                'displayName': "Most Indepth Feedback Views"
            },
            {
                'request': socialModel.getMostUsedTools.bind( null, toolSelect, topN ),
                'process': farr,
                'resultPath': 'socialStats.mostUsedTools',
                'displayName': "Most Frequent Tool"
            },
            {
                'request': socialModel.getCommonFeedbackTool.bind(null,toolSelect, topN),
                'process': farr,
                'resultPath': 'socialStats.mostFeedbackTools',
                'displayName': "Most Feedback from Tool"
            },
            {
                'request': socialModel.getCommonViewedMoreFeedbackTool.bind(null, toolSelect, topN),
                'process': farr,
                'resultPath': 'socialStats.mostViewedMoreFeedbackTool',
                'displayName': "Most Indepth Feedback Views"
            },

            {
                'request': studentModel.getMyMostCommonFeedback.bind(null,id, toolSelect, 3),
                'process': setArrayAsValueInObject,
                'resultPath': 'userStats.commonFeedback',
                'displayName': "Most Common Feedback"
            },
            {
                'request': studentModel.getSubmissionToErrorRate.bind(null,id, toolSelect),
                'process': farr,
                'resultPath': 'userStats.submissionErrorRate',
                'displayName': "Submission Feedback Rate"

            },
            {
                'request': socialModel.getOtherSubmissionToErrorRate.bind(null, id, toolSelect),
                'process': farr,
                'resultPath': 'socialStats.submissionErrorRate',
                'displayName': "Submission Feedback Rate"
            }
        ];
        genericStatsRequest(requests,callback);
    }

    function collectDashboardData( req, res, callback ) {
        studentProfile.getStudentProfileAndClasses(req.user.id, function(err, studentData) {
            var toolType = req.session.toolSelect == "Programming" ? "programming" : "writing";
            var toolFunc =  req.session.toolSelect == "Programming" ? programmingStats : writingStats;

            if(studentData) {
                var studentProfile = _.pick(studentData[0],  ["id","name", "bio", "avatarFileName"]);
                var courses = _.map(studentData, obj => _.pick(obj,["courseId","code","courseName","description","disciplineType"]));
                if(courses.length == 0 ) {
                    // NO courses
                    var page = { "title":"Dashboard", "studentProfile":studentProfile, "courses": courses,'assignments': [],
                                     'assignmentTasks':[], 'skills': [], 'focus': [], 'toolType': toolType};
                    toolFunc(req,res,function(stats) {
                        page['stats'] =  stats;
                        callback(req,res,page);
                    });
                }
                else {
                    studentSkill.getAssigmentAndTaskList(studentProfile.id, function(errTask, taskData) {

                        var assignmentTasks = taskData;
                        studentSkill.getStudentSkills( studentProfile.id, function(skillErr, skills) {

                            var focus = null;
                            if( req.session.dailyFocus )
                                focus = req.session.dailyFocus;

                            var page = { "title":"Dashboard", "studentProfile":studentProfile, "courses": courses,'assignments': getAssignments(assignmentTasks),
                                         'assignmentTasks':assignmentTasks, 'skills': skills, 'focus': focus, 'toolType': toolType };

                            toolFunc(req,res,function(stats) {
                                page['stats'] =  stats;
                                callback(req,res,page);
                            });
                        });
                    });
                }
            }
            else {
                res.status(500).end();
            }
        });
    }

    /**
     * Display data from the backend.
     * @param  {[type]} req  [description]
     * @param  {[type]} res  [description]
     * @param  {[type]} next )
     * @return {[type]}      [description]
     */
    app.get('/dashboard', function( req, res, next ) {
        res.render( viewPath + "dashboard", { "title":"Dashboard"});
    });

    /**
     * Dashboard data setups up the controller to have the same data as the backend expects.
     * @param  {[type]} req  [description]
     * @param  {[type]} res)
     * @return {[type]}      [description]
     */
    app.get('/dashboard/data', function(req,res) {
        collectDashboardData(req,res, function(req,res,data) {
            res.json(data);
        });
    });

    /**
     * Post request from client-angular not a real form. Sending us select info on course/assignment focus data.
     * @param  {[type]} req    [description]
     * @param  {Object} res){                     req.session.dailyFocus [description]
     * @return {[type]}        [description]
     */
    app.post('/dashboard/assignmentFocusData', function(req,res){
        req.session.dailyFocus = {
            courseId: req.body.focusCourseId,
            assignmentId: req.body.focusAssignmentId
        };
        tracker.trackEvent( iosocket, event.changeEvent(req.user.sessionId, req.user.id, "assignmentFocus", req.session.dailyFocus));
        req.session.save();
    });

    app.post('/dashboard/getAllQuestions', function(req,res) {
        var q = `SELECT id, name FROM questionnaire WHERE assignmentId=${req.body.assignmentId}`;
        db.query(q, function(err, questionnaire){
            if(err) {
                Logger.error(err);
                res.end();
            }
            q = `SELECT id, title, fields, routes, isFirst, isLast FROM questionnaire_questions WHERE questionnaireId=${questionnaire[0].id}`;
            db.query(q, function(err, questionData){
                if(err) {
                    Logger.error(err);
                    res.end();
                }

                var first = questionData.find(function(element) {
                    return element.isFirst == 1;
                });

                if (!first) res.end();

                questionData.splice(questionData.indexOf(first), 1);
                questionData.unshift(first);

                for (var i = 0; i < questionData.length; i++) {
                    questionData[i].fields = JSON.parse(questionData[i].fields);
                }

                res.json({
                    name: questionnaire[0].name,
                    questions: questionData
                });
            });
        });
    });

    app.post('/dashboard/getIntialQuestion', function(req,res) {
        /*
        var data = {
            name: 'Sample questionnaire',
            question: q1
        };
        res.json(data);
        */
        var q = `SELECT id, name FROM questionnaire WHERE assignmentId=${req.body.assignmentId}`;
        db.query(q, function(err, questionnaire){
            if(err) {
                Logger.error(err);
                res.end();
            }
            q = `SELECT id, title, fields, routes FROM questionnaire_questions WHERE questionnaireId=${questionnaire[0].id} AND isFirst=1`;
            db.query(q, function(err, questionData){
                if(err) {
                    Logger.error(err);
                    res.end();
                }

                res.json({
                    name: questionnaire[0].name,
                    question: {
                        id: questionData[0].id,
                        title: questionData[0].title,
                        fields: JSON.parse(questionData[0].fields)
                    }
                });
            });
        });
    });

    app.post('/dashboard/getNextQuestion', function(req,res) {
        counter++;
        console.log(counter);
        //res.json(arr[counter]);

        var q;

        //store req.body.response in the database before getting the next question

        q = `SELECT routes FROM questionnaire_questions WHERE id=${req.body.questionId}`;
        console.log(q);
        db.query(q, function(err, routes){
            if(err) {
                Logger.error(err);
                res.end();
            }
            //actually determine the next item in the routes instead of just using the number
            var route = routes[0].routes;
            console.log(route);
            
            q = `SELECT id, title, fields, isLast FROM questionnaire_questions WHERE id=${route}`;
            db.query(q, function(err, questionData){
                if(err) {
                    Logger.error(err);
                    res.end();
                }

                var data = {
                    id: questionData[0].id,
                    title: questionData[0].title,
                    fields: JSON.parse(questionData[0].fields),
                    isLast: questionData[0].isLast
                };
                console.log(data);
                res.json(data);
            });
        });
    });

    app.post('/dashboard/getPrevQuestion', function(req,res) {
        counter--;
        console.log(counter);
       // res.json(arr[counter]);
        var q;

        //store req.body.response in the database before getting the next question

        q = `SELECT routes FROM questionnaire_questions WHERE id=${req.body.questionId}`;
        db.query(q, function(err, routes){
            if(err) {
                Logger.error(err);
                res.end();
            }

            //actually determine the next item in the routes instead of just using the number
            var route = routes[0].routes - 2;
            console.log(route);
            
            q = `SELECT id, title, fields, isLast FROM questionnaire_questions WHERE id=${route}`;
            db.query(q, function(err, questionData){
                if(err) {
                    Logger.error(err);
                    res.end();
                }

                var data = {
                    id: questionData[0].id,
                    title: questionData[0].title,
                    fields: JSON.parse(questionData[0].fields),
                    isLast: questionData[0].isLast
                };
                console.log(req.body);
                res.json(data);
            });
        });
    });
}
