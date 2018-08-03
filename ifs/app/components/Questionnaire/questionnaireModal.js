$(function() {
	// var modal = UIkit.modal('#questionnaire');
	// 
	var i = 0
	var list = ["What is the name of the assignment?", "When is the assignment due?", "How comfortable are you with this assignment?"];
	var modalList = ["#assignText", "#dueDate", "#comfort"];

	$("#questionnaire").click(function(event)	{
		event.preventDefault();

		// Disable modal Alert
		var div = $("#modalAlert");
		div.toggleClass("uk-hidden",true);

		var title = $("#modalTitle");
		title.text("Task Decomposition Modal");

		var questionNum = $("#questionNum");
		questionNum.text("Question " + (i+1));

		var questionText = $("#questionText");
		questionText.text(list[i])


		for(var j = 0; j < list.length; j++)
		{
			if(j == i)
			{
				$(modalList[j]).toggleClass("uk-hidden", false);
			}
			else
			{
				$(modalList[j]).toggleClass("uk-hidden", true);
			}
		}

		var modal = UIkit.modal("#questionnaireModal");
        modal.show();

	})

	$("#Next").click(function(event) 	{

		var nameAssignment = $("#assignText").val();
		var dueDate = $("#dueDate").val();
		var comfortLevel = $("input[name='radio']:checked").val();

		var insert = {'assignment': nameAssignment, 'dueDate': dueDate, 'comfortLevel': comfortLevel}

		console.log(insert);

		$.ajax({
			type: 'POST',
			url: '/questionnaire',
			data: insert
			
		}).done(function(data) {
			
		})

		i++;

		if(i > list.length-1)
		{
			i = list.length-1;
		}

		var questionNum = "Question " + (i+1);

		$("#questionNum").text(questionNum);
		$("#questionText").text(list[i]);

		for(var j = 0; j < list.length; j++)
		{
			if(j == i)
			{
				$(modalList[j]).toggleClass("uk-hidden", false);
			}
			else
			{
				$(modalList[j]).toggleClass("uk-hidden", true);
			}
		}


		
	})

	$("#Prev").click(function(event) 	{

		i--;

		if(i < 0)
		{
			i = 0;
		}

		var questionNum = "Question " + (i+1);

		$("#questionNum").text(questionNum);
		$("#questionText").text(list[i]);

		for(var j = 0; j < list.length; j++)
		{
			if(j == i)
			{
				$(modalList[j]).toggleClass("uk-hidden", false);
			}
			else
			{
				$(modalList[j]).toggleClass("uk-hidden", true);
			}
		}

		
	})

	$("#test").click(function(event)	{
		console.log("test");	

	})
})