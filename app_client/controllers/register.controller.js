(function () {

  angular
    .module('giscolab')
    .controller('registerCtrl', registerCtrl);

  registerCtrl.$inject = ['$location', 'authentication'];
  function registerCtrl($location, authentication) {
    var vm = this;

    // Register the new user
    vm.credentials = {
        firstName: "",
        lastName: "",
        email: "",
        userName: "",
        password: "",
        password2: "",
        birthday: "",
        info: "",
        registrDate: ""
    };


    vm.onSubmit = function () {
        if (vm.credentials.password !== vm.credentials.password2) {
            alert("Passwwörter stimmen nicht überein!");
        } else {
            console.log('Submitting registration');
            authentication
                .register(vm.credentials)
                .error(function (err) {
                    alert(err);
                })
                .then(function () {
                    $location.path('/account');
                });
        }
    };

  }

})();