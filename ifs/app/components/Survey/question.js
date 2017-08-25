/**
 * This is CRUD calls for questions
 */
var db = require( __configs + 'database');
var dbcfg = require(__configs + 'databaseConfig');
var Errors = require(__components + "Errors/errors");

/*
function getQuestion( questionSurveyId, questionIndex, callback ) {
    var req = "SELECT * FROM " + dbcfg.question_table + " (surveyId, language, text, visualFile, type) values (?,?,?,?,?)";
    db.query(req, questionData, function(err,data){
        console.log("INSERT Question");
        callback(err,data);
    });
}
*/

function getQuestions( surveyId, callback ) {
    var req = "SELECT * FROM " + dbcfg.question_table + " WHERE surveyId = ?";
    db.query(req, questionData, function(err,data){
        callback(err,data);
    });
}

function insertQuestion( questionData, callback ) {
    var req = "INSERT INTO " + dbcfg.question_table + " (surveyId, language, origOrder, text, visualFile, type) values (?,?,?,?,?,?)";
    db.query(req, questionData, function(err,data){
        callback(err,data);
    });
}

function updateQuestion( questionData, callback ) {
    var req = "UPDATE " + dbcfg.question_table + " (questionData) values (?, ?, ?)";
    db.query(req,[questionData], function(err,data){
        callback(err,data);
    });
}

function deleteQuestion( questionData, callback ) {
    var req = " DELETE FROM " + dbcfg.question_table + " WHERE questionName = ?";
    db.query(req,questionData, function(err,data){
        callback(err,data);
    });
}

module.exports.getQuestions = getQuestions;
module.exports.insertQuestion = insertQuestion;
module.exports.deleteQuestion = deleteQuestion;