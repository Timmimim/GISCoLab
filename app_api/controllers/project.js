var mongoose = require('mongoose');
var Project = mongoose.model('Project');
var User = mongoose.model('User');
var bodyParser = require("body-parser");
var fs = require('fs');
var formidable = require('formidable');
var path = require('path');
var archiver = require('archiver');
var dirTree = require("directory-tree");

//var _ = require( 'lodash' );

module.exports.createProject = function(req, res){
    var project = new Project();

	var coll = req.body.collaborators;

    User.findOne({'userName': req.body.userName}, function (err, obj){
        if (err || obj.id === null || obj.id === undefined){
            console.log("something went wrong");
        } else {

            project.projectName = req.body.projectName;
            project.uniqueKey = req.body.uniqueKey;
            project.ownerID = obj._id;
			project.ownerName = req.body.userName;
            project.info = req.body.info;
            project.dateCreated = Date.now();

			for(var zaehl = 0; zaehl < coll.length; zaehl++){
				console.log(coll[zaehl]);
				User.findOne({'email': coll[zaehl]}, {'email': 1}, function (err, collabo) {
					if (err) {
						console.log("something went wrong");
					} else if (collabo === null) {
						console.log("Passed email address is not a registered user; collaborator was not added");
					} else {
						console.log(collabo);
						project.collaborators.push(collabo.email);
					}
				});
			}

            setTimeout( function () {
				project.save(function(err) {
					res.status(200);
					res.json({
						"status": "everything worked fine"
					});
					setTimeout( function ()
					{
						obj.ownProjects.push({projectName: req.body.projectName, projectID: project._id});
						obj.save(function(error){
							if(error){
								console.log("something went wrong");
							}
						});
					}, 50);
				});
			}, 50);

            for(var i = 0; i < coll.length; i++){
                User.findOne({'email': coll[i]}, function (err, collabo){
                    if (err){
                        console.log("something went wrong");
                    } else if (collabo === null) {
                        console.log(coll[i] + " is not a registered user; collaborator was not added");
                    } else {
                        collabo.coopProjects.push({projectName: project.projectName, projectID: project._id});
                        collabo.save(function(e){
                            if(e){
                                console.log("something went wrong");
                            }
                        })
                    }
                });
            }
        }
    });
    for(var j=0; j < req.body.collaborators.length; j++){
        User.findOne({'email': req.body.collaborators[j]}, function (e, col){
            if(e) {
                console.log("something went wrong");
            } else if (col === null)
            {
                console.log(req.body.collaborators[j] + " is not a valid collaborator")

            } else {
                project.collaboratorID.push(col._id);
                project.update();
            }
        });
    }
    var exec = require('child_process').exec;
    function puts(error, stdout, stderr) { if(error){ console.log(error)}else{console.log(stdout)} };
	var projDirName = req.body.uniqueKey;
	projDirName = projDirName.replace(/(\s)/g, "__");
	console.log(projDirName);
    exec("cd projectData && mkdir "+projDirName+"", puts);
    setTimeout(function () {
        exec("cd projectData/"+projDirName+" && mkdir rScripts", puts);
        exec("cd projectData/"+projDirName+" && mkdir txtFiles", puts);
        exec("cd projectData/"+projDirName+" && mkdir Layers", puts);
        project.filePath.push("projectData", "projectData/"+req.body.uniqueKey, "projectData/"+req.body.uniqueKey+"/rScripts", "projectData/"+req.body.uniqueKey+"/txtFiles", "projectData/"+req.body.uniqueKey+"/Layers");

    }, 40);
};

module.exports.projectRead = function(req, res) {

    Project
        .findById(req.params.id, function(err, obj){
            if(err){
                res.status(401).json("could not load the project");
            } else {
				res.status(200).json(obj);
            }
        });
};


module.exports.projectUpdate = function(req, res) {

    //var query = {'ownerID': req.payload._id};

    Project
        .findByIdAndUpdate(req.params.id, req.body, function(err, obj) {
            if(err){
                res.status(401).json("couldnt update the project");
            } else{
                res.status(200).json(obj);
            }
        });
};


module.exports.projectDelete = function (req, res) {

    //var query = {'ownerID': req.payload._id};

    Project
        .findById(req.params.id, function(err, obj) {
            if(err){
                res.status(401).json("couldnt delete the project");
            } else{
                User.findOneAndUpdate({_id: obj.ownerID}, {$pull: {ownProjects: {projectID: obj._id}}}, function(err, data){
                    if(err){
                        console.log("something went wrong");
                    } else {
                        console.log("perfect");
                    }
                });

                for(var i = 0; i < obj.collaborators.length; i++){
                    User.findOneAndUpdate({email: obj.collaborators[i]}, {$pull: {coopProjects: {projectID: obj._id}}}, function(err, data){
                        if(err){
                            console.log("something went wrong");
                        } else {
                            console.log("nice");
                        }
                    });
                }

                var exec = require('child_process').exec;
                function puts(error, stdout, stderr) { if(error){ console.log(error)}else{console.log(stdout)} };


				var projDirName = obj.uniqueKey.replace(/(\s)/g, "__");
				exec("cd projectData && rm -r " +projDirName +"", puts);

				obj.remove();
				res.status(200).json("removed the project");
        }});
};

module.exports.uploadFile = function(req, res) {

    var form = new formidable.IncomingForm();

    form.multiples = false;

    form.uploadDir = path.join(__dirname, '../../projectData');

    console.log(path.join(__dirname, '../../projectData'));

	var projDirName = req.params.key.replace(/(\s)/g, "__");

	// every time a file has been uploaded successfully,
	// rename it to it's original name
    form.on('file', function (field, file) {
        if(file.type === 'text/plain'){
            fs.rename(file.path, path.join(form.uploadDir+'/'+projDirName+'/txtFiles', file.name));

        } else
		if(file.type === 'text/x-r-source'){
            fs.rename(file.path, path.join(form.uploadDir+'/'+projDirName+'/rScripts', file.name));

        } else
		{
			alert("Bitte nur Dateien vom Typ .R oder .txt hochladen!");
			res.send('Bitte nur Dateien vom Typ .R oder .txt hochladen.');
		}
    });

// log any errors that occur
    form.on('error', function (err) {
        console.log('An error has occured: \n' + err);
    });

// once all the files have been uploaded, send a response to the client
    form.on('end', function () {
        res.end('success');
    });

// parse the incoming request containing the form data
    form.parse(req);
};

module.exports.downloadZip = function(req, res){

	var exec = require('child_process').exec;
	function puts(error, stdout, stderr) { if(error){ console.log(error)}else{console.log(stdout)} };

	var uniKey = req.params.key.replace(/(\s)/g, "__");

	exec('cd projectData/ && rm '+uniKey+'.zip', puts);

	var child = exec('cd projectData/ && zip -r '+uniKey+'.zip '+uniKey+'/*', puts);

	var zipPath = 'projectData/'+uniKey+'.zip';

	console.log(zipPath);

    child.on('close', function() {
		setTimeout(function () {
			console.log('archiver has been finalized and the output file descriptor has closed.');

			res.status(200).download(zipPath);

		},200);
	});

    child.on('error', function(err) {
        if(err) {
            res.status(400).json("could not zip the file");
        }
    });
    child.finalize();

    /*setTimeout( function(){
        exec("rm -r " +zipPath);
    }, 100);
    */
};


module.exports.saveRCode = function (req, res)
{
	var projDirName = req.params.key.replace(/(\s)/g, "__");
	var code = req.body.code;
	var fName = req.body.fName;
	var fileName = path.join(__dirname, '../../projectData/'
			+ projDirName + '/rScripts/'
			+ fName +'') + '.R';

	fs.writeFile(fileName, code, function(err) {
		if (err) {
			console.log("Something went wrong when saving the RScript file: " + err);
			res.send('Something went wrong when saving the RScript file!');
		}
	});

	res.status(200).send("R File successfully saved!");
};

module.exports.saveNote = function (req, res)
{
	var projDirName = req.params.key.replace(/(\s)/g, "__");
	var note = req.body.note;
	var fName = req.body.fName;
	var fileName = path.join(__dirname, '../../projectData/'
			+ projDirName + '/txtFiles/'
			+ fName +'') + '.txt';

	fs.writeFile(fileName, note, function(err) {
		if (err) {
			console.log("Something went wrong when saving the txt file: " + err);
			res.send('Something went wrong when saving the txt file!');
		}
	});

	res.status(200).send("Note successfully saved!");
};

module.exports.runExistingRCode = function(req, res){
	var projDirName = req.params.key.replace(/(\s)/g, "__");
	var pathToScript = path.join(__dirname, "../../projectData/" + projDirName + "/rScripts/getCSVwithSciDBData.R");

	var exec = require('child_process').exec;
	function puts(error, stdout, stderr) { if(error){ console.log(error)}else{console.log(stdout)} };
	var child = exec("Rscript " + pathToScript, puts);
	child.on('close', function () {
		res.status(200).send('hubba-bubba');
	});
};


module.exports.runRCode = function (req, res)
{

	console.log(rey.body);
	var projDirName = req.payload._id;

	var fName = req.body.fName;
	var pkg = req.body.pkg;
	var code = req.body.code;
	var bbox = req.body.bbox;
	var data = req.body.data;

	if (bbox === null) {
		bbox = {
			xMin: '',
			xMax: '',
			yMin: '',
			yMax: ''
		}
	}

	var exec = require('child_process').exec;
	function puts(error, stdout, stderr) { if(error){ console.log(error)}else{console.log(stdout)} };

	// exec("mkdir userTemps/" + projDirName +"", puts);

	var date = Date.now();

	var fileName = path.join(__dirname, '../../userTemps/'
			+ projDirName +'/temp_' + date +'') + '.R';

	console.log(fileName);

	var fillR = "" +
		pkg +
		"\n SCIDB_HOST = \"128.176.148.9\" \n " +
		"SCIDB_PORT = \"30021\" \n " +
		"SCIDB_USER = \"giscolab\" \n " +
		"SCIDB_PW   =  \"BxLQmZVL2qqzUhU93usYYdxT\" \n" +
		" \n " +
		"Sys.setenv(http_proxy=\"\") \n" +
		"Sys.setenv(https_proxy=\"\") \n" +
		"Sys.setenv(HTTP_PROXY=\"\") \n" +
		"Sys.setenv(HTTPS_PROXY=\"\") \n" +
		"library(scidbst)" +
		"bbox = extent("
			+bbox.xMin+","
			+bbox.xMax+","
			+bbox.yMin+","+
			bbox.yMax+") \n" +
		code
		+ "\n \n" +
		"library(gdalUtils) \n"+
		"firstimage = slice(x = scidbst(\""+data.spectrData+"\"), \"t\", 0) # extrahiere erstes Bild \n" +
		"as_PNG_layer(firstimage,TMS = TRUE, " +
					"bands = "+data.band+
					", layername=\"" +data.layerName+
					"\", min="+data.min+", max="+data.max+
					", rm.scidb = TRUE)"
		;

	console.log("fillR");
	console.log(fillR);

	fs.writeFile(fileName, fillR, function(err) {
		if (err) {
			console.log("Something went wrong when saving the RScript file: " + err);
			res.send('Something went wrong when saving the RScript file!');
		}
	});

	res.status(200).send("R File successfully saved!");
};

module.exports.loadTreedata = function(req, res)
{
    console.log("lalala");
    console.log(req.params.key);
    console.log("lalala");
    var dT = dirTree(path.join(__dirname, '../../projectData/' + req.params.key));
    setTimeout(function () {
        console.log(dT);
        res.status(200).json(dT);
    }, 50);

};
module.exports.loadTreedata2 = function(req, res)
{
    console.log(req.params.key);
    console.log(req.params.string);
    console.log(req.params.filename);
    fs.readFile('projectData/' + req.params.key + "/" + req.params.string + "/" + req.params.filename, function (err, data) {
        if (err) throw err;
        console.log("filepush");
        console.log(data);
        res.status(200).send(data);
    });
}