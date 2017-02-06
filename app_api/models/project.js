var mongoose = require ( 'mongoose' );

var projectSchema = new mongoose.Schema({

    ownerID: {
       type: String,
       required: true
    },

    ownerName: {
        type: String,
        required: true
    },

    projectName: {
       type: String,
       required: true
    },

    uniqueKey: {
        type: String,
        required: true,
        unique: true
    },

    info: {
       type: String,
       required: true
    },

    dateCreated: {
       type: Date,
       required: true
    },

    dateEdited: {
       type: Date,
       required: false
    },

    collaborators: [{
       type: String,
       required: false
    }],

    collaboratorID: [{
        type: String,
        required: false
    }],

    filePath: [{
       type: String,
       required: false
    }]
});

mongoose.model( 'Project', projectSchema );