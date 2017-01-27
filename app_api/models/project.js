var mongoose = require ( 'mongoose' );

var projectSchema = new mongoose.Schema({

    ownerID: {
       type: String,
       required: true
    },

    projectName: {
       type: String,
       required: true
    },

    /**
     *
     * uniqueKey ist eine Kombination aus userName des Erstellers und projectName
     *
     * !!!: Muss im Front End erstellt werden !!!
     *
     * da userName im System unique sein muss, ist auch diese Kombination unique;
     *  --> pro User kann nur ein Projekt mit gleichem projectName erstellt werden,
     *      aber global gesehen sind gleiche Projekt-Namen möglich
     *
     *  TODO: falls diese Lösung sich als blöd erweist, killen und projectName unique:true setzen
     */
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