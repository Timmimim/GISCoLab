(function() {

    angular
        .module('giscolab')
        .controller('projectsCreateCtrl', projectsCreateCtrl);

    projectsCreateCtrl.$inject = ['$location', 'authentication', '$scope'];
    function projectsCreateCtrl($location, authentication, $scope) {
        var vm = this;

        // Create the new project
        vm.project = {
            projectName: "",
            ownerID: "",
            userName: "",
            info: "",
            dateCreated: "",
            uniqueKey: "",
            collaborators: [""]
        };

        vm.onSubmit = function () {
            console.log("submitting project");
            var colArray = vm.project.collaborators;
            colArray = colArray.replace(/^[, ]+|[, ]+$|[, ]+/g, " ").trim().split(' ');
            vm.project.collaborators = colArray;
            vm.project.uniqueKey = vm.project.userName + vm.project.projectName;
            authentication
                .project(vm.project)
                .error(function (err) {
                    alert(err);
                })
                .then(function(){
                    console.log("alles gut");
                    $location.path('/account');
                });
        }


    }
})();