(function() {

    angular
        .module('giscolab')
        .controller('currentCtrl', currentCtrl);

    currentCtrl.$inject = ['$location', 'meanData', 'userService', '$scope'];
    function currentCtrl($location, meanData, userService, $scope) {
        console.log("current Controller is running!!!");

        //*****************************************************************************************************
        //*****************************************************************************************************
        //*****************************************************************************************************
        // Treeview

        tree = new webix.ui({
            container:"treebox",
            view:"tree",
            data: [
                { id:"branch1", value:"The Shawshank Redemption", data:[
                    { id:"part1", value:"Part 1" },
                    { id:"part2", value:"Part 2" }
                ]}
            ]
        });

        //'node' variable will contain an object of the related tree node
        var node = tree.getItem('branch1');

        //you can access data members directly
        var value = node.value; // ->"The Shawshank Redemption"

        //*****************************************************************************************************
        //*****************************************************************************************************
        //*****************************************************************************************************


        $scope.buttonCodeToggle = function(){
            angular.element( document.querySelector('#code')).addClass('active');
            angular.element( document.querySelector('#otherdata')).removeClass('active');

        };
        $scope.buttonTreeToggle = function(){
            angular.element( document.querySelector('#code')).removeClass('active');
            angular.element( document.querySelector('#otherdata')).addClass('active');
        };
    }
})();