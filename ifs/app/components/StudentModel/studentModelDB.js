var db = require( __configs + 'database');
var config = require(__configs + 'databaseConfig');
var Errors = require(__components + "Errors/errors");
var dbHelpers = require(__components + "Databases/dbHelpers");

module.exports = {

    getMyMostUsedTools: function( userId, runType, nLimit, callback ) {
        var q = "select toolName, COUNT(*) as value from feedback where userId = ? and runType = ? group by toolName ORDER by value desc LIMIT " + nLimit.toString();
        db.query(q,[userId,runType],callback);
    },

    getMyMostCommonSpellingMistakes: function( userId, nLimit, callback ) {
        var q = "select target, suggestions, COUNT(*) as value from feedback where userId = ? and type = 'spelling' group by target,suggestions ORDER by value desc LIMIT " + nLimit.toString();
        db.query(q,userId,callback);
    },

    getMySpellingAccuracy: function( userId, callback ) {
        var q = "select name,SUM(statValue) as value from feedback_stats where userId = ? and name in('correctWordCount','misspelledWordCount') GROUP BY name";
        db.query(q,userId,callback);
    },

    getMyMostCommonFeedback: function( userId, runType, nLimit, callback ) {
        var q = "select feedback, COUNT(*) as value from feedback where userId = ? and runType = ? GROUP BY feedback ORDER BY value desc LIMIT "  + nLimit.toString();
        db.query(q,[userId,runType],callback);
    },

    getMyCommonFeedbackTool: function(userId, runType, nLimit, callback ) {
        var q = "select a.toolName, COUNT(*) as value from ( select fi.userId, fi.action, f.toolName  " +
                "from feedback_interaction fi, feedback f where fi.feedbackId = f.id and fi.userId = ? and f.runType = ? ) a " +
                "GROUP by a.toolName ORDER BY value desc LIMIT " + nLimit.toString();
        db.query(q,[userId,runType],callback);
    },

    getMyCommonViewedMoreFeedbackTool: function(userId, runType, nLimit, callback ) {
        var q = "select a.toolName, COUNT(*) as value from ( select fi.userId,fi.action,f.toolName " +
                "from feedback_interaction fi, feedback f where  fi.action = 'viewedMore' and fi.feedbackId = f.id and fi.userId = ? and  f.runType = ? ) a " + 
                "GROUP by a.toolName ORDER BY value desc LIMIT " + nLimit.toString();
        db.query(q,[userId,runType],callback);
    },

    getSubmissionToErrorRate: function(userId, runType, callback) {
        var q =  "select count( distinct(submissionId)) as submissionCount , count(submissionId) as feedbackItems from feedback where userId = ? and runType = ?"
        db.query(q,[userId,runType],callback);
    },

    getSubmissionsPerSession: function( userId, callback ) {
        var q = dbHelpers.buildSelect( config.submission_table, "sessionId, COUNT(*) as value") + dbHelpers.buildWS('userId') + " GROUP BY sessionId";
        db.query( q, [userId], callback );
    },

    getSubmissionsPerDate: function(userId, callback){
        var format = "DATE_FORMAT(date, '%Y-%m-%d')";
        var q = dbHelpers.buildSelect( config.submission_table, format + " as sessionDate, count(*) as value ") + dbHelpers.buildWS('userId') + " GROUP BY " + format;
        db.query( q, [userId], callback );
    },

    /** SECTION USED FOR OLM  */
     getSubmissionsBetweenDates: function(userId, minDate, maxDate, callback){
        var format = "DATE_FORMAT(date, '%Y-%m-%d')";
        var q = dbHelpers.buildSelect( config.submission_table, format + " as sessionDate, count(*) as value ") + dbHelpers.buildWS('userId') + " and date >= ? AND date <= ? GROUP BY " + format;
        db.query( q, [userId, minDate,maxDate], callback );
    },

    getFeedbackItemPerSubmissionBetweenDates: function(userId, minDate, maxDate, callback) {
        var q = dbHelpers.buildSelect( config.feedback_table, " runType as series, submissionId as labels, COUNT(*) as value ") + dbHelpers.buildWS('userId') + " and date >= ? AND date <= ? GROUP BY submissionId, runType"
        db.query( q, [userId, minDate,maxDate], callback );
    },

    getFeedbackViewedPerSubmissionBetweenDates: function(userId, minDate, maxDate, callback){
        var q = dbHelpers.buildSelect( config.feedback_interaction_table, " submissionId as labels, action as series, COUNT(*) as value ") + dbHelpers.buildWS('userId') + " and date >= ? AND date <= ? GROUP BY submissionId, action"
        db.query( q, [userId, minDate,maxDate], callback );
    }
}
