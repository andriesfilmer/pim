appControllers.controller('UserController', ['$scope', '$state', '$stateParams', '$window', 'flash', 'UserService', 'AuthenticationService',
  function UserController($scope, $state, $stateParams, $window, flash, UserService, AuthenticationService) {

    // Capitalize function for feedback in falsh messages
    String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    };

    $scope.signIn = function signIn(email, password) {
      UserService.signIn(email, password).then(function(response) {
          AuthenticationService.isAuthenticated = true;

          // We choose localStorage i.o. sessionStorage so that 
          // we keep the token after clossing the browser.
          flash('succes', 'Signed in');
          $window.localStorage.token = response.data.token;
          $window.localStorage.user_id = response.data.user_id;

          $state.go('home');

      }, function(reponse) {
        if(status === 0 && status === null) {
          flash('alert', 'Not online');
        }
        else {
          flash('alert', 'Wrong credentials');
        }
        console.log("Signin status: " + status);
      });
    };


    $scope.logOut = function logOut() {

      AuthenticationService.isAuthenticated = false;

      // We have logout so we delete localstore for security.
      flash('success', 'Logged out and deleted local information');
      $window.localStorage.clear();
      $state.go('start');
    };


    $scope.register = function register(fullname, email, password, passwordConfirm) {
      UserService.register(fullname, email, password, passwordConfirm)
      .then(function(response) {
         console.log('UserController -> register success');
         flash('success', 'Thanks for registering, you can login now');
         $state.go('signin');
      }, function(response) {
        console.log(response.data);
        flash('alert', response.data);
      });
    };


    $scope.sendPasswordChangeToken = function sendPasswordChangeToken(email) {
      UserService.sendToken(email).then(function(response) {
        $scope.tokenSend = true;
        flash('succes', response.data);
      }, function(response) {
        $scope.tokenSend = false;
        flash('alert', response.data);
      });

    };

    // Set 'token' from querystring for changePassword which
    // is send by API service token/link to users mailbox.
    if ($stateParams.token !== undefined) {
      $window.localStorage.token = $stateParams.token;
    }

    $scope.changePassword = function changePassword(password, passwordConfirm) {
      UserService.changePassword(password, passwordConfirm).then(function(response) {
        flash('succes', 'Password has changed and you are logged-in');

        // Set token with long expire date and user_id from API.
        $window.localStorage.token = response.data.token;
        $window.localStorage.user_id = response.data.user_id;

        $state.go('home');

      }, function(response) {
        console.log(response.data);
        flash('warning', response.data);
      });
    };

  }
]);

