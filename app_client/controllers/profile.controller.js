(function() {
  
  angular
    .module('giscolab')
    .controller('profileCtrl', profileCtrl);

  profileCtrl.$inject = ['$location', 'meanData', 'userService', '$scope','projectService'];
  function profileCtrl($location, meanData, userService, $scope, projectService) {
    var vm = this;

    vm.user = {};

      vm.saveUser = saveUser;
      vm.deleteUser = deleteUser;

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

      function saveUser() {
          if (vm.user.password !== vm.user.password2) {
              alert("Paswörter stimmen nicht überein!");
          } else {
              userService.update(vm.user)
                  .then(function () {
                      $location.path('/account');
                  })
                  .catch(function (e) {
                      console.log(e);
                  });
          }
      }

      function deleteUser() {
          userService.deleteUsers(vm.user)
              .then(function(){
                  $location.path('/account');
              })
              .catch(function (e) {
                  console.log(e);
              });
      }
  }

})();