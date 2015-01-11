appControllers.controller('UserController', ['$scope', '$state', '$window', 'flash', 'UserService', 'AuthenticationService',
  function UserController($scope, $state, $window, flash, UserService, AuthenticationService) {

    $scope.signIn = function signIn(username, password) {
      if (username !== null && password !== null) {

        UserService.signIn(username, password).success(function(data) {
            AuthenticationService.isAuthenticated = true;
            // We choose localStorage i.o. sessionStorage so that 
            // we keep content after clossing the browser.
            flash('succes', 'Signed in');
            $window.localStorage.token = data.token;
            $state.go('home');
        }).error(function(status, data) {
          if(status === 0 && status === null) {
            flash('alert', 'Not online');
          }
          else {
            flash('alert', 'Wrong credentials');
          }
          console.log("Signin status: " + status);
        });
      }
    };

    $scope.logOut = function logOut() {
      AuthenticationService.isAuthenticated = false;
      // We have logout so we delete localstore for security.
      flash('success', 'Logged out and deleted local information');
      $window.localStorage.clear();
      $state.go('home');
      console.log('UserController -> logOut');
    };

    $scope.register = function register(username, password, passwordConfirm) {
      console.log('UserController -> register');
      if (AuthenticationService.isAuthenticated) {
        console.log('Register -> Already logged in!'); 
        flash('alert', 'Already logged in!');
      }
      else {
        UserService.register(username, password, passwordConfirm).success(function(data) {
          console.log('UserController -> register success');
          flash('success', 'Succesfull registered as new a user');
        }).error(function(status, data) {
          flash('alert', 'Something went wrong');
          console.log("Signin status: " + status);
          console.log(data);
        });
      }
      $state.go('home');
    };
  }
]);

