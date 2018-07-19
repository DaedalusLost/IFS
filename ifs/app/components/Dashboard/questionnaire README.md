# IMPORTANT NOTES
********************************************************
As of July 19th, the questionnaire interface and all required backend are complete except for the following:
* User cannot advance if any required input is found to be incomplete, however this is not visually shown to the user yet
* Checkbox routes do not have a determination algorithm, and simply use a default value
* Progress sub-lists are not supported yet
    * This is useful for checkboxes in which, for example, three loops of questions need to be run if three options are checked (ask Grant if unclear)

# Files and functions that make it happen
********************************************************

## Pug files
`dashBoardSkillFocus.pug` and `dashbaordInput.pug` makeup the visual of the questionnaires. `dashBoardSkillFocus.pug` has the questionnaire modal at the very bottom, with a few other minor modifications throughout. `dashbaordInput.pug` has the code that displays the form data that is sent to the page.

## dashboardController.js
The following is a list of the important variables in the `dashboardController.js` script:
* `progress`: the array of questions that the user has progressed through for the current questionnaire. The questions stored in this array store the user's input and determined routes in the questionnaire objects. User input is stored in the `model` key, and determined outcome is stored in the `chosenRoute` object.
* `index`: the current user index in their `progress`.
* `$scope.questionnaires`: the master list of all questionnaires that pertain to the user and the classes that they are enrolled in.
* `$scope.allQuestions`: the master list of all questions that are involved in the user's questionnaires.
* `$scope.allProgress`: the master list of all user progress for all their questionnaires.
* `$scope.questionBank`: the list of questions for the current survey from which new questions can be pulled.
* `$scope.question`: the current question that is displayed to the user, pulled either from `progress` if it is one that the user has seen/interacted with before, or from `$scope.questionBank` as a new question.

The following is the list of new functions and a brief description of what they do:
* `$scope.requiredComplete`: checks if all of the required fields for the current question have been completed before allowing the user to advance to the next question.
* `$scope.showSurvey`: determines the next questionnaire to show based on the selected focus, and loads and displays the appropriate data. Progress will resume where the user last left off in the survey.
* `$scope.prevQuestion`: shows the previous question.
* `$scope.nextQuestion`: determines the next route to take based on the user's input to the curent question, stores user progress, and then displays the next question.
* `$scope.finishSurvey`: sets the questionnaire to finished, then saves the progress to the database using `$scope.saveProgress`.
* `$scope.closeSurvey`: save progress to the database using `$scope.saveProgress`.
* `$scope.saveProgress`: updates the progress list with the current progress, then sends the data to the server for saving.
* `$scope.toggleButtons`: toggles the displayed buttons to show the right set of `back`, `next`, and `finish` buttons based on the current question.

The `$http.get('/dashboard/data')` call at the bottom was modified in the lower half of the callback to store questionnaire data retrieved from the server, and then sets the current progress and questionnaire data if the user has already set a focus before navigating to the dashboard page.

## dashboardRoutes.js
The two routes in this script that makes questionnaires possible are `/dashboard/data` and `/dashboard/saveProgress`.

### /dashboard/data
### /dashboard/saveProgress