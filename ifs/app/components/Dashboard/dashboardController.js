let q1 = {
    title: 'Radio buttons example:',
    fields: [
        {type: 'radio', name: 'radioButtons', options: [{label: 'Option A'}, {label: 'Option B'}, {label: 'Option C'}]}
    ],
    isFirst: true
};

let q2 = {
    title: 'Checkboxes example:',
    fields: [
        {type: 'checkbox', options: [{label: 'Option A'}, {label: 'Option B'}, {label: 'Option C'}]}
    ]
};

let q3 = {
    title: 'Multiple inputs example:',
    fields: [
        {type: 'select', data: 'selectField', label: 'Select', options: [{label: 'Option A'}, {label: 'Option B'}, {label: 'Option C'}]},
        {type: 'text', label: 'Label', placeholder: 'Placeholder', id: 'textID'}
    ],
    isLast: true
};

//The above is dummy data that should be generated elsewhere during actual use

//Dummy function for now, but should be used to grab the previous question from the server
function getPrevious(q) {
    if (q == q2) return q1;
    if (q == q3) return q2;
}

//Dummy function for now, but should be used to grab the next question from the server
function getNext(q) {
    if (q == q1) return q2;
    if (q == q2) return q3;
}

app.controller( "dashboardCtrl", function($scope, $http) {
    $scope.courses=[];
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

    $scope.question = q1;
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
        UIkit.modal('#questionnaireModal').show();
    }

    $scope.prevQuestion = function() {
        $scope.question = getPrevious($scope.question);
        $scope.toggleButtons();
    }

    $scope.nextQuestion = function() {
        $scope.question = getNext($scope.question);
        $scope.toggleButtons();
    }

    $scope.finishSurvey = function() {
        UIkit.modal('#questionnaireModal').hide();
        $scope.getNextSelected();
        $scope.finishedSurvey = true;
    }

    $scope.closeSurvey = function() {
        if ($scope.activeStudentFocus != 2)
            $scope.getNextSelected();
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

    $scope.questionAnswered = function() {
        for (var i in $scope.question.fields) {
            var field = $scope.question.fields[i];
            console.log($scope.question.fields[i]);
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

        if( $scope.focus ) {

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
    });
});