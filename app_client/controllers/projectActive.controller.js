(function() {

    angular
        .module('giscolab'/*, ['ngFileUpload']*/)
        .controller('projectActiveCtrl', projectActiveCtrl);

    projectActiveCtrl.$inject = ['$location', 'meanData', 'userService', '$scope', 'projectService', '$rootScope'/*, 'Upload', '$window'*/];
    function projectActiveCtrl($location, meanData, userService, $scope, projectService, $rootScope/*, Upload, $window*/) {
        var vm = this;

        vm.project = {};

        var pid = projectService.getID();

        meanData.getProject(pid)
            .success(function (data) {
                vm.project = data;
                var proKey = vm.project.uniqueKey;
                $rootScope.uniKey = proKey;
                loadnewjson();
            })
            .error(function (e) {
                console.log(e);
            });

        // Load the selected data in the right areas
        var loadnewjson = function () {
            $.ajax({
                url: "api/loadTreedata/" + $rootScope.uniKey,
                type: "Get",
                success: function (data) {
                    var old = JSON.stringify(data).replace(/children/g, "data"); //convert to JSON string
                    var newjson = JSON.parse(old); //convert back to array
                    console.log(newjson);

                    $rootScope.newjson = newjson;
                },
                error: function (msg) { alert(msg); }
            });
        };



        $scope.anFunction = function (id) {
            userService.setCollID(id);
            $location.path('/userProfile');
        };
    }
})();
