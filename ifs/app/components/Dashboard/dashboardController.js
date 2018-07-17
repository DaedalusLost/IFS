let q1 = {
    title: 'Radio buttons example:',
    fields: [
        {type: 'radio', model: 'radioButtons', options: [
            {label: 'Option A', value: 'opA'},
            {label: 'Option B', value: 'opB'},
            {label: 'Option C', value: 'opC'}
        ]}
    ],
    isFirst: true
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
    ],
    isLast: true
};
/*
DELETE FROM questionnaire_questions;
DELETE FROM questionnaire;
INSERT INTO questionnaire (id, assignmentId, name) VALUES (1, 1, 'Data Structures Questionnaire');
INSERT INTO questionnaire (id, assignmentId, name) VALUES (2, 2, 'Angel of Death Questionnaire');
INSERT INTO questionnaire_questions (id, questionnaireId, isFirst, title, fields, routes) VALUES (1, 1, 1, 'Radio buttons example:', '[{"type": "radio", "model": "radioButtons", "options": [{"label": "Option A", "value": "opA"},{"label": "Option B", "value": "opB"},{"label": "Option C", "value": "opC"}]}]', '2'); 
INSERT INTO questionnaire_questions (id, questionnaireId, title, fields, routes) VALUES (2, 1, 'Checkboxes example:', '[{"type": "checkbox", "options": [{"label": "Option A", "model": "opAmodel"},{"label": "Option B", "model": "opBmodel"},{"label": "Option C", "model": "opCmodel"}]}]', '3');
INSERT INTO questionnaire_questions (id, questionnaireId, title, fields, routes) VALUES (3, 1, 'Multiple inputs example:', '[{"type": "select", "model": "selectField", "label": "Select", "options": [{"label": "Option A"}, {"label": "Option B"}, {"label": "Option C"}]},{"type": "text", "label": "Label", "placeholder": "Placeholder", "id": "textID", "model": ""}]', '4');
INSERT INTO questionnaire_questions (id, questionnaireId, title, fields, routes) VALUES (4, 1, 'Radio buttons example:', '[{"type": "radio", "model": "radioButtons", "options": [{"label": "Option A", "value": "opA"},{"label": "Option B", "value": "opB"},{"label": "Option C", "value": "opC"}]}]', '5'); 
INSERT INTO questionnaire_questions (id, questionnaireId, title, fields, routes) VALUES (5, 1, 'Checkboxes example:', '[{"type": "checkbox", "options": [{"label": "Option A", "model": "opAmodel"},{"label": "Option B", "model": "opBmodel"},{"label": "Option C", "model": "opCmodel"}]}]', '6');
INSERT INTO questionnaire_questions (id, questionnaireId, title, fields, routes) VALUES (6, 1, 'Multiple inputs example:', '[{"type": "select", "model": "selectField", "label": "Select", "options": [{"label": "Option A"}, {"label": "Option B"}, {"label": "Option C"}]},{"type": "text", "label": "Label", "placeholder": "Placeholder", "id": "textID", "model": ""}]', '7');
INSERT INTO questionnaire_questions (id, questionnaireId, title, fields, routes) VALUES (7, 1, 'Radio buttons example:', '[{"type": "radio", "model": "radioButtons", "options": [{"label": "Option A", "value": "opA"},{"label": "Option B", "value": "opB"},{"label": "Option C", "value": "opC"}]}]', '8'); 
INSERT INTO questionnaire_questions (id, questionnaireId, title, fields, routes) VALUES (8, 1, 'Checkboxes example:', '[{"type": "checkbox", "options": [{"label": "Option A", "model": "opAmodel"},{"label": "Option B", "model": "opBmodel"},{"label": "Option C", "model": "opCmodel"}]}]', '9');
INSERT INTO questionnaire_questions (id, questionnaireId, isLast, title, fields, routes) VALUES (9, 1, 1, 'Multiple inputs example:', '[{"type": "select", "model": "selectField", "label": "Select", "options": [{"label": "Option A"}, {"label": "Option B"}, {"label": "Option C"}]},{"type": "text", "label": "Label", "placeholder": "Placeholder", "id": "textID", "model": ""}]', '10');
INSERT INTO questionnaire_questions (id, questionnaireId, isFirst, title, fields, routes) VALUES (10, 2, 1, 'Radio buttons example:', '[{"type": "radio", "model": "radioButtons", "options": [{"label": "Option A", "value": "opA"},{"label": "Option B", "value": "opB"},{"label": "Option C", "value": "opC"}]}]', '2'); 
INSERT INTO questionnaire_questions (id, questionnaireId, title, fields, routes) VALUES (12, 2, 'Checkboxes example:', '[{"type": "checkbox", "options": [{"label": "Option A", "model": "opAmodel"},{"label": "Option B", "model": "opBmodel"},{"label": "Option C", "model": "opCmodel"}]}]', '3');
INSERT INTO questionnaire_questions (id, questionnaireId, title, fields, routes) VALUES (12, 2, 'Multiple inputs example:', '[{"type": "select", "model": "selectField", "label": "Select", "options": [{"label": "Option A"}, {"label": "Option B"}, {"label": "Option C"}]},{"type": "text", "label": "Label", "placeholder": "Placeholder", "id": "textID", "model": ""}]', '4');
INSERT INTO questionnaire_questions (id, questionnaireId, title, fields, routes) VALUES (13, 2, 'Radio buttons example:', '[{"type": "radio", "model": "radioButtons", "options": [{"label": "Option A", "value": "opA"},{"label": "Option B", "value": "opB"},{"label": "Option C", "value": "opC"}]}]', '5'); 
INSERT INTO questionnaire_questions (id, questionnaireId, title, fields, routes) VALUES (14, 2, 'Checkboxes example:', '[{"type": "checkbox", "options": [{"label": "Option A", "model": "opAmodel"},{"label": "Option B", "model": "opBmodel"},{"label": "Option C", "model": "opCmodel"}]}]', '6');
INSERT INTO questionnaire_questions (id, questionnaireId, isLast, title, fields, routes) VALUES (15, 2, 1, 'Multiple inputs example:', '[{"type": "select", "model": "selectField", "label": "Select", "options": [{"label": "Option A"}, {"label": "Option B"}, {"label": "Option C"}]},{"type": "text", "label": "Label", "placeholder": "Placeholder", "id": "textID", "model": ""}]', '7');
*/
//The above is dummy data that should be generated elsewhere during actual use
var progress = [];
var index = 0;

app.controller("dashboardCtrl", function($scope, $http) {
    $scope.courses = [];
    $scope.assignments = [];
    $scope.stats = [];
    $scope.courseSelect = null
    $scope.assignmentSelect = null;
    $scope.assignmentTasks = [];
    $scope.activeStudentFocus = 0;
    $scope.focus =  null;
    $scope.toolType = null;
    $scope.skills = [];
    $scope.studentProfile = null;

    $scope.questionnaireTitle = null;
    $scope.questionnaireId = 0;
    $scope.allQuestions = [];
    $scope.question = null;
    $scope.showBack = false;
    $scope.showNext = true;
    $scope.showFinish = false;
    $scope.finishedSurvey = false;

    /**
     * Selects the next active DIV for student focus.
     * @return {[type]} [description]
     */
    $scope.getNextSelected = function() {
        $scope.activeStudentFocus = ($scope.activeStudentFocus +1) % 3;
        if( $scope.activeStudentFocus == 0 )
            $scope.resetSelectedFocus();
        if( $scope.activeStudentFocus == 2 )
            $scope.setSessionData();
    }

    $scope.assignmentComplete = function() {
        $scope.activeStudentFocus = 3;
    }

    $scope.resetSelectedFocus = function() {
        $scope.activeStudentFocus = 0;
        $scope.courseSelect = null;
        $scope.assignmentSelect = null;
    }

    /**
     * Send an http request to server to indicate a focus has been set.
     * This can then be saved as today's focus for the session
     */
    $scope.setSessionData = function() {
        console.log('setSessionData');
        if ($scope.hasFocusItem() ) {
            var data = {
                'focusCourseId':  $scope.assignmentSelect.courseId,
                'focusAssignmentId': $scope.assignmentSelect.assignmentId
            };
            $http.post('/dashboard/assignmentFocusData', data ).then( function(success) {
            },function(error){
            });
        }
    }

    $scope.hasFocusItem = function() {
        return $scope.assignmentSelect && $scope.courseSelect;
    }

    $scope.showSurvey = function() {
        if (!$scope.finishedSurvey) {  
            UIkit.modal('#questionnaireModal').show();
        } else {
            if ($scope.activeStudentFocus != 2)
                $scope.getNextSelected();
        }
    }

    $scope.prevQuestion = function() {
        progress[index] = $scope.$$ChildScope.prototype.question;
        index--;
        $scope.question = progress[index];
        $scope.toggleButtons();
    }

    $scope.nextQuestion = function() {
        //Actually figure out routes later, for now just use what's given
        var route = $scope.question.routes;

        //Serve the next question and store progress appropriately
        if (progress.length == index || progress.length - 1 == index) {
            progress[index] = $scope.$$ChildScope.prototype.question;
            index++;
            firstQuestion = false;

            for (var i = 0; i < $scope.allQuestions.length; i++) 
                if ($scope.allQuestions[i].id == route)
                    $scope.question = JSON.parse(JSON.stringify($scope.allQuestions[i])); //Deep copy the new question
        } else {
            progress[index] = $scope.$$ChildScope.prototype.question;
            index++;

            //If in the middle of the questionnaire and the determined route is different
            //from the next progress item, invalidate all further progress
            if (progress.length != index && progress[index-1].routes != route) {
                progress = progress.slice(0, index);
                for (var i = 0; i < $scope.allQuestions.length; i++) 
                    if ($scope.allQuestions[i].id == route)
                        $scope.question = JSON.parse(JSON.stringify($scope.allQuestions[i])); //Deep copy the new question
            } else {
                $scope.question = progress[index];
            }
        }

        //Change the question and the buttons appropriately
        $scope.toggleButtons();
    }

    $scope.finishSurvey = function() {
        UIkit.modal('#questionnaireModal').hide();
        if ($scope.activeStudentFocus != 2)
            $scope.getNextSelected();
        $scope.finishedSurvey = true;
        $scope.saveProgress();
    }

    $scope.closeSurvey = function() {
        progress[index] = $scope.$$ChildScope.prototype.question;
        if ($scope.activeStudentFocus != 2)
            $scope.getNextSelected();
        $scope.saveProgress();
    }

    $scope.saveProgress = function() {
        var data = {
            'questionnaireId':  $scope.questionnaireId,
            'progress': progress,
            'progressIndex': index,
            'isCompleted': $scope.finishedSurvey
        };
        $http.post('/dashboard/saveProgress', data ).then( function(res) {
        },function(error){
        });
    }

    $scope.toggleButtons = function() {
        if ($scope.question.isFirst) {
            $scope.showBack = false;
            $scope.showNext = true;
            $scope.showFinish = false;
        } else if ($scope.question.isLast) {
            $scope.showBack = true;
            $scope.showNext = false;
            $scope.showFinish = true;
        } else {
            $scope.showBack = true;
            $scope.showNext = true;
            $scope.showFinish = false;
        }
    }

    $http.get('/dashboard/data').then( function(res) {
        // NOTE: This uses a second route to load data into controller.
        // Main Layout information and more static information is loaded via Express routes.
        $scope.assignments = res.data.assignments;
        $scope.stats = res.data.stats;
        $scope.courses = res.data.courses;
        $scope.assignmentTasks = res.data.assignmentTasks;
        $scope.focus = res.data.focus;
        $scope.toolType = res.data.toolType;
        $scope.skills = res.data.skills;
        $scope.studentProfile = res.data.studentProfile;
        if($scope.focus) {
            $scope.courseSelect = null;
            $scope.assignmentSelect = null;
            // Attach course select and assignment select
            for( var i = 0; i < $scope.courses.length;i++ ) {
                if( $scope.courses[i].courseId == $scope.focus.courseId) {
                    $scope.courseSelect = $scope.courses[i];
                }
            }
            for( var i = 0; i < $scope.assignments.length;i++ ) {
                if( $scope.assignments[i].assignmentId == $scope.focus.assignmentId) {
                    $scope.assignmentSelect = $scope.assignments[i];
                }
            }
            if($scope.hasFocusItem())
                $scope.activeStudentFocus = 2;
        }

        /*
        //Questionnaire data
        $scope.allQuestions = res.data.q.questions;
        $scope.questionnaireId = res.data.q.id;
        progress = res.data.q.progress;
        index = res.data.q.progressIndex;
        $scope.finishedSurvey = res.data.q.isCompleted;
        $scope.questionnaireTitle = res.data.q.name;

        if (progress.length > 0) {
            $scope.question = progress[index];
            $scope.toggleButtons();
        } else {
            $scope.question = JSON.parse(JSON.stringify($scope.allQuestions[0])); //Get based on progress
            progress.push($scope.$$ChildScope.prototype.question);
        }

        $scope.toggleButtons();
        */

        console.log(res.data);
    });
});