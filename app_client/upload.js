$(document).on('change', ':file', function() {
    var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    input.trigger('fileselect', [numFiles, label]);
});
$(document).ready( function() {
    $(':file').on('fileselect', function(event, numFiles, label) {

        var input = $(this).parents('.input-group').find(':text'),
            log = numFiles > 1 ? numFiles + ' files selected' : label;

        if( input.length ) {
            input.val(log);
        } else {
            if( log ) alert(log);
        }

    });
});

$('#uploadButton').on('click', function () {
    uploadFile();
    alert("Please reload the project to get the data in the treestructure!");
});

function uploadFile() {
    var form = document.getElementById('file-upload-form');
    var formData = new FormData();

    var uniqueKey = document.getElementById('uniqueKey').value;
    uniqueKey = uniqueKey.replace(/(\s)/g, "__");

    files = $('#file-input').get(0).files;

    formData.append('uploads[]', files[0], files[0].name);

    $.ajax({
        type: "POST",
        data: formData,
        url: '/api/fileUpload/'+uniqueKey,
        processData: false,
        contentType: false,
        timeout: 10000,
        success: function(data, textStatus){
            console.log("successfully saved");
            //TODO: Trigger Data Tree Update
        },
        error: function(xhr, textStatus, errorThrown){
            console.log("saving failed");
        }
    })
}