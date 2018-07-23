# Progress Notes
********************************************************
As of July 19th, the questionnaire interface and all required backend are complete except for the following:
* User cannot advance if any required input is found to be incomplete, however this is not visually shown to the user yet
* Checkbox routes do not have a determination algorithm, and simply use a default value
* Progress sub-lists are not supported yet. This is useful for checkboxes in which, for example, three loops of questions need to be run if three options are checked (ask Grant if unclear)

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
This route collects various dashboard data to send to the angular controller, including questionnaire data associated with the current user. `collectDashboardData` is untouched, however the callback is almost entirely new. The callback performs three queries in order to retrieve the questionaire data associated with the current user: 
1. Retrieves all questionnaires that are associated with the user's assignment list
2. Retreives all questions associated with the retrieved questionnaires
3. Retrieves user progress for all questionnaires that they have answered that are associated with the retrieved questionnaires

Some additional processing of the retrieved data is performed before being sent to the client. This processing is self-documented in the callback using comments.

### /dashboard/saveProgress
This route saves the user's progress that they have made on the current questionnaire. This route likely needs to be reworked to save everything in `allProgress` from the client side so that it can save everything at once - preferably once the user leaves the page or something of the sort. The route performs two queries:
1. Attempts to retrieve the user's questionnaire progress for the current questionnaire. The next query depends on this outcome.
2. If the questionnaire progress was retrieved from the database, then it is updated with the values sent from the client. If there was no questionnaire progress retrieved, a new entry will be created for the user's current progress.

# Question Formatting
Questions have various attributes which are explained in the following list. `fields` and `routes` will be explained in later sections.
* `questionnaireId`: is the id of the questionnaire that the current question is associated with
* `title`: is the sub-title underneath the questionnaire title that changes with each question. This is usually used to ask the question
* `isFirst`/`isLast`: are booleans that let the interface know what buttons are appropriate to display to the user
* `required`: indicates whether or not the current field is required to be completed by the user

## fields
`fields` is a JSON array of objects storing all of the fields that make up the user options for the current question. Each object is its own field; there are four types of fields: `radio`, `checkbox`, `select`, and `text`. Data for each form is stored in an `ng-model`, and thus each field has its own `model` field as appropriate, which can be named whatever you want.

### radio example
```
{
	type: "radio",
	model: "radioButtons",
	required: "false",
	options: [
		{"label": "Option A", "value": "opA"},
		{"label": "Option B", "value": "opB"},
		{"label": "Option C", "value": "opC"}
	]
}
```

### checkbox example
```
{
	type: "checkbox",
	required: "false",
	options: [
		{label: "Option A", model: "opAmodel"},
		{": "Option B", model: "opBmodel"},
		{label: "Option C", model: "opCmodel"}
	]
}
```

### select example
```
{
	type: "select",
	model: "selectField",
	required: "false", 
	label: "Select", 
	options: [
		"Option A",
		"Option B", 
		"Option C"
	]
}
```

### text example
```
{
	type: "text",
	label: "Label",
	placeholder: "Placeholder",
	id: "textID",
	model: "" //Always leave this blank unless you intend to have a predefined input here
}
```

## routes
Routes have an array of `options` that the user's input (`model`) can match to in order to determine the route. Otherwise, if no match is made, the route will use the `default` to determine what the outcome is. Routes in `options` have fields `toMatch` with `model`s. All routes have an `outcome` that will end up on the task list and an `id` of the next question.

Currently, only `radio` and `select` fields have a proper determination of routes using the `outcomes` array. Any other field simply uses the `default` for now. In addition, only the first field is able to determine routes at the moment.

### radio route example
```
{
	options: [
		{toMatch: "opA", outcome: "opA Outcome", id: "2"},
		{toMatch: "opB", outcome: "opB Outcome", id: "2"},
		{toMatch: "opC", outcome: "opC Outcome", id: "2"}
	], 
	default: {outcome: "defaultOutcome", id: "2"}
}
```

### select route example
```
{
	"options": [
		{toMatch: "Option A", outcome: "Option A Outcome", id: "4"},
		{toMatch: "Option B", outcome: "Option B Outcome", id: "4"},
		{toMatch: "Option C", outcome: "Option C Outcome", id: "4"}
	], 
	"default": {"outcome": "defaultOutcome", "id": "4"}
}
```

### default only route example
```
{
	default: {outcome: "defaultOutcome", id: "3"}
}
```

# Progress Formatting
The user's progress is saved in the form of an array of questions and their associated answers, along with a couple helper attributes to help keep track of everything:
* `questionnaireId`: associates a set of progress with a questionnaire
* `progressIndex`: the user's current position in the questionnaire
* `isCompleted`: boolean value that lets the client know whether or not to show the questionnaire

`progress` stores an array of questions, using their models to store the user's data and in order to keep a list of previous questions. 

There are a few other attributes in the progress array, and an example is needed to complete documentation here. However, I am in Ireland and I don't have anything to reference for this since I don't have MySQL working very well and I can't run the server. Hopefully this gets updated soon.

# Example Questionnaires and Questions

To test, perform the following MySQL query in order to setup two example questionnaires and appropriate questions.

```
INSERT INTO questionnaire (id, assignmentId, name) VALUES (1, 1, 'Example Questionnaire 1');
INSERT INTO questionnaire (id, assignmentId, name) VALUES (2, 2, 'Example Questionnaire 2');
INSERT INTO questionnaire_questions (id, questionnaireId, isFirst, title, fields, routes) VALUES (1, 1, 1, 'Radio buttons example:', '[{"type": "radio", "model": "radioButtons", "required": "true", "options": [{"label": "Option A", "value": "opA"},{"label": "Option B", "value": "opB"},{"label": "Option C", "value": "opC"}]}]', '{"options": [{"toMatch": "opA","outcome": "opA Outcome","id": "2"},{"toMatch": "opB","outcome": "opB Outcome","id": "2"},{"toMatch": "opC","outcome": "opC Outcome","id": "2"}], "default": {"outcome": "defaultOutcome", "id": "2"}}'); 
INSERT INTO questionnaire_questions (id, questionnaireId, title, fields, routes) VALUES (2, 1, 'Checkboxes example:', '[{"type": "checkbox", "required": "true", "options": [{"label": "Option A", "model": "opAmodel"},{"label": "Option B", "model": "opBmodel"},{"label": "Option C", "model": "opCmodel"}]}]', '{"default": {"outcome": "defaultOutcome", "id": "3"}}');
INSERT INTO questionnaire_questions (id, questionnaireId, title, fields, routes) VALUES (3, 1, 'Multiple inputs example:', '[{"type": "select", "model": "selectField", "required": "true", "label": "Select", "options": ["Option A", "Option B", "Option C"]},{"type": "text", "label": "Label", "placeholder": "Placeholder", "id": "textID", "model": ""}]', '{"options": [{"toMatch": "Option A","outcome": "Option A Outcome","id": "4"},{"toMatch": "Option B","outcome": "Option B Outcome","id": "4"},{"toMatch": "Option C","outcome": "opC Outcome","id": "4"}], "default": {"outcome": "defaultOutcome", "id": "4"}}');
INSERT INTO questionnaire_questions (id, questionnaireId, title, fields, routes) VALUES (4, 1, 'Radio buttons example:', '[{"type": "radio", "model": "radioButtons", "required": "true", "options": [{"label": "Option A", "value": "opA"},{"label": "Option B", "value": "opB"},{"label": "Option C", "value": "opC"}]}]', '{"options": [{"toMatch": "opA","outcome": "opA Outcome","id": "5"},{"toMatch": "opB","outcome": "opB Outcome","id": "5"},{"toMatch": "opC","outcome": "opC Outcome","id": "5"}], "default": {"outcome": "defaultOutcome", "id": "5"}}'); 
INSERT INTO questionnaire_questions (id, questionnaireId, title, fields, routes) VALUES (5, 1, 'Checkboxes example:', '[{"type": "checkbox", "required": "true", "options": [{"label": "Option A", "model": "opAmodel"},{"label": "Option B", "model": "opBmodel"},{"label": "Option C", "model": "opCmodel"}]}]', '{"default": {"outcome": "defaultOutcome", "id": "6"}}');
INSERT INTO questionnaire_questions (id, questionnaireId, title, fields, routes) VALUES (6, 1, 'Multiple inputs example:', '[{"type": "select", "model": "selectField", "label": "Select", "required": "true", "options": ["Option A", "Option B", "Option C"]},{"type": "text", "label": "Label", "placeholder": "Placeholder", "id": "textID", "model": ""}]', '{"options": [{"toMatch": "Option A","outcome": "Option A Outcome","id": "7"},{"toMatch": "Option B","outcome": "Option B Outcome","id": "7"},{"toMatch": "Option C","outcome": "opC Outcome","id": "7"}], "default": {"outcome": "defaultOutcome", "id": "7"}}');
INSERT INTO questionnaire_questions (id, questionnaireId, title, fields, routes) VALUES (7, 1, 'Radio buttons example:', '[{"type": "radio", "model": "radioButtons", "required": "true", "options": [{"label": "Option A", "value": "opA"},{"label": "Option B", "value": "opB"},{"label": "Option C", "value": "opC"}]}]', '{"options": [{"toMatch": "opA","outcome": "opA Outcome","id": "8"},{"toMatch": "opB","outcome": "opB Outcome","id": "8"},{"toMatch": "opC","outcome": "opC Outcome","id": "8"}], "default": {"outcome": "defaultOutcome", "id": "8"}}'); 
INSERT INTO questionnaire_questions (id, questionnaireId, title, fields, routes) VALUES (8, 1, 'Checkboxes example:', '[{"type": "checkbox", "required": "true", "options": [{"label": "Option A", "model": "opAmodel"},{"label": "Option B", "model": "opBmodel"},{"label": "Option C", "model": "opCmodel"}]}]', '{"default": {"outcome": "defaultOutcome", "id": "9"}}');
INSERT INTO questionnaire_questions (id, questionnaireId, isLast, title, fields, routes) VALUES (9, 1, 1, 'Multiple inputs example:', '[{"type": "select", "model": "selectField", "label": "Select", "required": "true", "options": ["Option A", "Option B", "Option C"]},{"type": "text", "label": "Label", "placeholder": "Placeholder", "id": "textID", "model": ""}]', '{"options": [{"toMatch": "Option A","outcome": "Option A Outcome","id": "10"},{"toMatch": "Option B","outcome": "Option B Outcome","id": "10"},{"toMatch": "Option C","outcome": "opC Outcome","id": "10"}], "default": {"outcome": "defaultOutcome", "id": "10"}}');
INSERT INTO questionnaire_questions (id, questionnaireId, isFirst, title, fields, routes) VALUES (10, 2, 1, 'Radio buttons example:', '[{"type": "radio", "model": "radioButtons", "required": "true", "options": [{"label": "Option A", "value": "opA"},{"label": "Option B", "value": "opB"},{"label": "Option C", "value": "opC"}]}]', '{"options": [{"toMatch": "opA","outcome": "opA Outcome","id": "11"},{"toMatch": "opB","outcome": "opB Outcome","id": "11"},{"toMatch": "opC","outcome": "opC Outcome","id": "11"}], "default": {"outcome": "defaultOutcome", "id": "11"}}'); 
INSERT INTO questionnaire_questions (id, questionnaireId, title, fields, routes) VALUES (11, 2, 'Checkboxes example:', '[{"type": "checkbox", "required": "true", "options": [{"label": "Option A", "model": "opAmodel"},{"label": "Option B", "model": "opBmodel"},{"label": "Option C", "model": "opCmodel"}]}]', '{"default": {"outcome": "defaultOutcome", "id": "12"}}');
INSERT INTO questionnaire_questions (id, questionnaireId, title, fields, routes) VALUES (12, 2, 'Multiple inputs example:', '[{"type": "select", "model": "selectField", "label": "Select", "required": "true", "options": ["Option A", "Option B", "Option C"]},{"type": "text", "label": "Label", "placeholder": "Placeholder", "id": "textID", "model": ""}]', '{"options": [{"toMatch": "Option A","outcome": "Option A Outcome","id": "13"},{"toMatch": "Option B","outcome": "Option B Outcome","id": "13"},{"toMatch": "Option C","outcome": "opC Outcome","id": "13"}], "default": {"outcome": "defaultOutcome", "id": "13"}}');
INSERT INTO questionnaire_questions (id, questionnaireId, title, fields, routes) VALUES (13, 2, 'Radio buttons example:', '[{"type": "radio", "model": "radioButtons", "required": "true", "options": [{"label": "Option A", "value": "opA"},{"label": "Option B", "value": "opB"},{"label": "Option C", "value": "opC"}]}]', '{"options": [{"toMatch": "opA","outcome": "opA Outcome","id": "14"},{"toMatch": "opB","outcome": "opB Outcome","id": "14"},{"toMatch": "opC","outcome": "opC Outcome","id": "14"}], "default": {"outcome": "defaultOutcome", "id": "14"}}'); 
INSERT INTO questionnaire_questions (id, questionnaireId, title, fields, routes) VALUES (14, 2, 'Checkboxes example:', '[{"type": "checkbox", "required": "true", "options": [{"label": "Option A", "model": "opAmodel"},{"label": "Option B", "model": "opBmodel"},{"label": "Option C", "model": "opCmodel"}]}]', '{"default": {"outcome": "defaultOutcome", "id": "15"}}');
INSERT INTO questionnaire_questions (id, questionnaireId, isLast, title, fields, routes) VALUES (15, 2, 1, 'Multiple inputs example:', '[{"type": "select", "model": "selectField", "label": "Select", "required": "true", "options": ["Option A", "Option B", "Option C"]},{"type": "text", "label": "Label", "placeholder": "Placeholder", "id": "textID", "model": ""}]', '{"options": [{"toMatch": "Option A","outcome": "Option A Outcome","id": "16"},{"toMatch": "Option B","outcome": "Option B Outcome","id": "16"},{"toMatch": "Option C","outcome": "opC Outcome","id": "16"}], "default": {"outcome": "defaultOutcome", "id": "16"}}');
```