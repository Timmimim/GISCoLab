(function() {

    angular
        .module('giscolab')
        .controller('projectUpdateCtrl', projectUpdateCtrl);

    projectUpdateCtrl.$inject = ['$location', 'meanData', 'projectService'];
    function projectUpdateCtrl($location, meanData, projectService) {
        var vm = this;

        vm.project = {};

        vm.saveProject = saveProject;
        vm.deleteProject = deleteProject;

        var pid = projectService.getID();

        meanData.getProject(pid)
            .success(function(data) {
                vm.project = data;
            })
            .error(function (e) {
                console.log(e);
            });

        // Save the new data
        function saveProject() {
            vm.project.dateEdited = Date.now();
            var colArray = vm.project.collaborators;
            colArray = colArray.replace(/^[, ]+|[, ]+$|[, ]+/g, " ").trim().split(' ');
            vm.project.collaborators = colArray;

                projectService.updateProject(vm.project, pid)
                    .then(function () {
                        $location.path('/projectActive');
                    })
                    .catch(function (e) {
                        console.log(e);
                    });
        }

        // Delete the project
        function deleteProject() {
            projectService.deleteProject(vm.project, pid)
                .then(function(){
                    $location.path('/projectActive');
                })
                .catch(function (e) {
                    console.log(e);
                });
        }
    }

})();
