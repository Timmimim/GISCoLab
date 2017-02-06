/**
 * Created by timmimim on 04.02.17.
 */
$('#saveCode').on('click', function () {
	saveR();

    alert("Please reload the project to get the data in the treestructure!");
});

function saveR()
{

	var uniqueKey = document.getElementById('uniqueKey').value;

	var fName = document.getElementById('fileName').value;
	var code = document.getElementById('codearea').value;

	var data = {
		fName: fName,
		code: code
	};

	$.ajax({
		type: "POST",
		data: data,
		url: '/api/saveRCode/'+uniqueKey,
		timeout: 10000,
		success: function(data, textStatus){
			console.log("saved R code to RScript file : " + textStatus);
			//TODO: Trigger Data Tree Update
		},
		error: function(xhr, textStatus, errorThrown){
			console.log("saving failed");
			console.log(errorThrown);
		}
	})

}

$('#saveTXT').on('click', function () {
	saveTxt();
    alert("Please reload the project to get the data in the treestructure!");
});

function saveTxt()
{
	var uniKey = document.getElementById('uniqueKey').value;
	var fName = document.getElementById('noteFName').value;
	var note = document.getElementById('txtview').value;

	var data = {
		fName: fName,
		note: note
	};

	$.ajax({
		type: "POST",
		data: data,
		url: '/api/saveNote/'+uniKey,
		timeout: 10000,
		success: function(data, textStatus){
			console.log("saved note to txtFiles : " + textStatus);
			//TODO: Trigger Data Tree Update
		},
		error: function(xhr, textStatus, errorThrown){
			console.log("saving failed");
			console.log(errorThrown);
		}
	})
}