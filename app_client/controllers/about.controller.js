(function() {

    angular
        .module('giscolab')
        .controller('aboutCtrl', aboutCtrl);

    aboutCtrl.$inject = ['$location', 'meanData', 'userService', '$scope', 'projectService'];
    function aboutCtrl($location, meanData, userService, $scope, projectService) {
        console.log("about Controller is running!!!");

        var vm = this;

        vm.user = {};

        meanData.getProfile()
            .success(function(data) {
                vm.user = data;
            })
            .error(function (e) {
                console.log(e);
            });

        $scope.myFunction = function (id) {
            projectService.setID(id);
            $location.path('/projectActive');
        }
    }
})();
