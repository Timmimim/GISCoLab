/**
 * Created by timmimim on 04.02.17.
 */
/*
$('#runCode').on('click', function () {
	runR();
});
*/

function addRow() {
	$('#dataTable').append(
		'<tr>'+
			'<td><textarea style="resize: none; height: 24px; " placeholder="As specified in your code"></textarea></td>' +
			'<td><textarea style="resize: none; height: 24px; " placeholder="Look up dataset below"></textarea></td>'+
			'<td><textarea style="resize: none; height: 24px; width: 50px" placeholder="One band per row"></textarea></td>'+
			'<td><textarea style="resize: none; height: 24px; " placeholder="Name of your new Layer"></textarea></td>'+
			'<td><textarea style="resize: none; height: 24px; width: 50px" placeholder="Min"></textarea></td>'+
			'<td><textarea style="resize: none; height: 24px; width: 50px" placeholder="Max"></textarea></td>'+
		'</tr>'
	)
}

function runR ()
{
   var output;
	if (document.getElementById('xMin') === null) {
		var conf = confirm("You have not drawn any polygon yet! \n" +
			"Without one, bbox will not be generated automatically.\n" +
			"Have you set one by hand? \n" +
			"If yes, press OK.   If no, press Cancel.");
		if(!conf) {return}
	} else {
		output = {
			xMin: document.getElementById('xMin').value,
			xMax: document.getElementById('xMax').value,
			yMin: document.getElementById('yMin').value,
			yMax: document.getElementById('yMax').value
		};
	}

	var uniqueKey = document.getElementById('uniqueKey').value;

	var fName = document.getElementById('fileName').value;
	var pkg = document.getElementById('packages').value;
	var code = document.getElementById('codearea').value;

	var dataTable = [];

	var table = document.getElementById('dataTable');
	var rowLength = table.rows.length;

	setTimeout ( function () {

		for(var i=1; i<rowLength; i+=1) {
			var row = {
				outName : table.rows[i].cells[0].firstChild.value.replace(/\s/g, ''),
				spectrData: table.rows[i].cells[1].firstChild.value.replace(/\s/g, ''),
				band: table.rows[i].cells[2].firstChild.value.replace(/\s/g, ''),
				layerName : table.rows[i].cells[3].firstChild.value.replace(/\s/g, ''),
				min: table.rows[i].cells[4].firstChild.value.replace(/\s/g, ''),
				max: table.rows[i].cells[5].firstChild.value.replace(/\s/g, '')
			};
			if (row.outName === '' || row.spectrData === '' || row.band === '' || row.layerName === '' || row.min === '' || row.max === ''){
				alert("Data Table row number "+i+" was ignored, it was missing data.");
			} else {
				dataTable[dataTable.length] = row;
			}
		}

	setTimeout(function () {

		var data = {
			fName: fName,
			pkg: pkg,
			code: code,
			bbox: output,
			data: dataTable
		};
		console.log(data);

		alert("This may take a while, depending on your code and bbox.");
		$.ajax({
			type: "POST",
			data: data,
			headers: {
				Authorization: 'Bearer ' + localStorage['mean-token']
			},
			url: "/api/runRCode/"+ uniqueKey,
			timeout: 5000,
			success: function(data, textStatus){
				console.log("successfully saved : " + textStatus);
				//console.log(data);
				//TODO: Trigger Data Tree Update

				alert("<bold>Berechnung von "+ fname+" abgeschlossen!</bold> \n\n Die resultierenden TMS Layer liegen im entsprechenden Projektordner bereit. \n Bitte hierfür das Projekt neu laden!");
			},
			error: function(xhr, textStatus, errorThrown){
				console.log("saving failed");
				alert("Something went wrong while running "+fname+".");
			}
		})

	}, 50);

	},20);
}



/*
$('#lameTest').on('click', function () {
	runExistingScript();
});

function runExistingScript() {
	var uniqueKey = document.getElementById('uniqueKey').value;
	$.ajax({
		type: "POST",
		url: '/api/runExistingCode/' + uniqueKey,
		timeout: 100000,
		success: function () {
			console.log("yay");
		},
		error: function () {
			console.log("dangit! :(");
		}
	})
}
	*/