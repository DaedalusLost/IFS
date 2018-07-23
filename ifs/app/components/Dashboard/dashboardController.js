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

    //Questionnaire variables for storing information used in this script
    $scope.questionnaires = [];
    $scope.allQuestions = [];
    $scope.questionBank = [];
    $scope.allProgress = [];
    $scope.question = null;

    //Data for display purposes
    $scope.questionnaireTitle = null;
    $scope.questionnaireId = 0;
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

    /**
     * Ensures that all of the required fields for the current question have been completed before pressing next
     * Loops through each required field to ensure that the user has appropriately filled their information
     */
    $scope.requiredComplete = function() {
        if ($scope.$$ChildScope && $scope.$$ChildScope.prototype.question) {
            for (let field of $scope.$$ChildScope.prototype.question.fields) {
                if (field.required) { 
                    if ((field.type == "radio" || field.type == "select") && field.model == field.defaultModel) {
                        return false;
                    } else if (field.type == "checkbox") {
                        //Checks if any checkbox has been ticked, ever. Allows for all checkboxes to be blank.
                        //This may be undesirable in some cases, but no such examples were thought of when writing this
                        var flag = false;
                        for (let option of field.options) {
                            if (option.model === true || option.model === false) {
                                flag = true;
                                break;
                            }
                        }
                        if (!flag) return false;
                    } else if (field.type == "text" && field.model == "") {
                        return false;
                    }
                }
            }
            return true;
        }
        return false;
    }

    $scope.showSurvey = function() {
        //Reset the progress and associated variables before determining the new set
        progress = [];
        index = 0;
        $scope.finishedSurvey = false;

        //Find the questionnaire to show based on the currently selected assignment
        for (var i = 0; i < $scope.questionnaires.length; i++) {
            if ($scope.assignmentSelect.assignmentId == $scope.questionnaires[i].assignmentId) {
                $scope.questionnaireId = $scope.questionnaires[i].id;
                $scope.questionnaireTitle = $scope.questionnaires[i].name;

                //Find the question bank to pull new questions from based on the current questionnaire
                for (j = 0; j < $scope.allQuestions.length; j++) {
                    if ($scope.allQuestions[j][0].questionnaireId == $scope.questionnaireId) {
                        $scope.questionBank = $scope.allQuestions[j];
                    }
                }

                //Find the progress (if applicable) connected to the current questionnaire
                for (j = 0; j < $scope.allProgress.length; j++) {
                    if ($scope.allProgress[j].questionnaireId == $scope.questionnaireId) {
                        progress = $scope.allProgress[j].progress;
                        index = $scope.allProgress[j].progressIndex;
                        $scope.finishedSurvey = $scope.allProgress[j].isCompleted;
                    }
                }
            }
        }

        if (!$scope.finishedSurvey && $scope.questionnaireId) {
            //Retrieve the question to be displayed, either from progress or from a deep copy from the question brank
            if (progress.length > 0) {
                $scope.question = progress[index];
            } else {
                $scope.question = JSON.parse(JSON.stringify($scope.questionBank[0]));
                progress.push($scope.$$ChildScope.prototype.question);
            }

            $scope.toggleButtons();
            UIkit.modal('#questionnaireModal').show();
        }

        //Advance to the task list page regardless of being finished
        if ($scope.activeStudentFocus != 2)
            $scope.getNextSelected();
    }

    $scope.prevQuestion = function() {
        //Store the current question in the progress list, and then iterate to the previous question in the list
        progress[index] = $scope.$$ChildScope.prototype.question;
        index--;
        $scope.question = progress[index];
        $scope.toggleButtons();  
    }

    $scope.nextQuestion = function() {
        //Determine the appropriate route to take for the next question
        var routeId = 0;
        var outcome = null;

        if ($scope.question.fields[0].type == "select" ||$scope.question.fields[0].type == "radio") {
            //Search through the options and try to match the model to find the route id
            for (let option of $scope.question.routes.options) {
                if ($scope.question.fields[0].model == option.toMatch) {
                    outcome = option.outcome;
                    routeId = option.id;
                }
            }

            //If there is no id found using the above determination, use the default (usually means no selection)
            if (!routeId) {
                routeId = $scope.question.routes.default.id;
                outcome = $scope.question.routes.default.outcome;
            }
        } else {
            //Checkboxes and have no route determination yet, and simply use the default route
            routeId = $scope.question.routes.default.id;
            outcome = $scope.question.routes.default.outcome;
        }

        //Save the newly determined route to the current question 
        $scope.$$ChildScope.prototype.question.chosenRoute = {
            id: routeId,
            outcome: outcome
        };

        //Save the current progress, and move to the next item in the list
        progress[index] = $scope.$$ChildScope.prototype.question;
        index++;

        //Serve the next question and store progress appropriately
        if (progress.length == index) { //End or beginning of questionnaire, respectively
            //Determine the next question from the id given by the route, and serve a deep copy of the new question
            for (var i = 0; i < $scope.questionBank.length; i++)
                if ($scope.questionBank[i].id == routeId)
                    $scope.question = JSON.parse(JSON.stringify($scope.questionBank[i]));
        } else {
            //If in the middle of the questionnaire and the determined route is different
            //from the next progress item, invalidate all further progress
            if (progress.length != index && progress[index-1].chosenRoute.id != routeId) {
                progress = progress.slice(0, index);

                //Determine the next question from the id given by the route, and serve a deep copy of the new questions
                for (var i = 0; i < $scope.questionBank.length; i++) 
                    if ($scope.questionBank[i].id == routeId)
                        $scope.question = JSON.parse(JSON.stringify($scope.questionBank[i]));
            } else {
                //If determined route is the same, advance to the next bit of progress
                $scope.question = progress[index];
            }
        }

        $scope.toggleButtons();
    }

    $scope.finishSurvey = function() {
        UIkit.modal('#questionnaireModal').hide();
        $scope.finishedSurvey = true;
        $scope.saveProgress();
    }

    $scope.closeSurvey = function() {
        progress[index] = $scope.$$ChildScope.prototype.question;
        $scope.saveProgress();
    }

    $scope.saveProgress = function() {
        //Save the current progress to the list of allProgress for the client side to keep updated
        var exists = false;

        //Check if it exists in the list of allProgresses, and if so update it
        for (j = 0; j < $scope.allProgress.length; j++) {
            if ($scope.allProgress[j].questionnaireId == $scope.questionnaireId) {
                $scope.allProgress[j].progress = progress;
                $scope.allProgress[j].progressIndex = index;
                $scope.allProgress[j].isCompleted = $scope.finishedSurvey;
                exists = true;
            }
        }

        //Send the current data to keep the server side updated
        var data = {
            'questionnaireId':  $scope.questionnaireId,
            'progress': progress,
            'progressIndex': index,
            'isCompleted': $scope.finishedSurvey
        };

        //If the current progrees is not in the list off allProgress, add it with the new data object
        if (!exists) {
            $scope.allProgress.push(data);
        }

        $http.post('/dashboard/saveProgress', data).then(function(res) {
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

        //Store all questionnaire data
        $scope.questionnaires = res.data.questionnaires;
        $scope.allQuestions = res.data.questions;
        $scope.allProgress = res.data.progress;

        if ($scope.focus) {
            //Find the questionnaire to show based on the currently selected assignment if present
            for (var i = 0; i < $scope.questionnaires.length; i++) {
                if ($scope.focus.assignmentId == $scope.questionnaires[i].assignmentId) {
                    $scope.questionnaireId = $scope.questionnaires[i].id;
                    $scope.questionnaireTitle = $scope.questionnaires[i].name;

                    //Find the question bank to pull new questions from based on the current questionnaire
                    for (j = 0; j < $scope.allQuestions.length; j++) {
                        if ($scope.allQuestions[j][0].questionnaireId == $scope.questionnaireId) {
                            $scope.questionBank = $scope.allQuestions[j];
                        }
                    }

                    //Find the progress (if applicable) connected to the current questionnaire
                    for (j = 0; j < $scope.allProgress.length; j++) {
                        if ($scope.allProgress[j].questionnaireId == $scope.questionnaireId) {
                            progress = $scope.allProgress[j].progress;
                            index = $scope.allProgress[j].progressIndex;
                            $scope.finishedSurvey = $scope.allProgress[j].isCompleted;
                        }
                    }
                }
            }

            if (!$scope.finishedSurvey && $scope.questionnaireId) {
                //Retrieve the question to be displayed, either from progress or from a deep copy from the question brank
                if (progress.length > 0) {
                    $scope.question = progress[index];
                } else {
                    $scope.question = JSON.parse(JSON.stringify($scope.questionBank[0]));
                    progress.push($scope.$$ChildScope.prototype.question);
                }

                $scope.toggleButtons();  
            }
        }
        console.log(res.data);
    });
});