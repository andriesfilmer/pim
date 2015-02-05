appControllers.controller('UserController', ['$scope', '$state', '$window', 'flash', 'UserService', 'AuthenticationService',
  function UserController($scope, $state, $window, flash, UserService, AuthenticationService) {

    // Capitalize function for feedback in falsh messages
    String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    }


    $scope.signIn = function signIn(email, password) {
      UserService.signIn(email, password).success(function(data) {
          AuthenticationService.isAuthenticated = true;
          // We choose localStorage i.o. sessionStorage so that 
          // we keep the token after clossing the browser.
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
    };


    $scope.logOut = function logOut() {

      AuthenticationService.isAuthenticated = false;

      // We have logout so we delete localstore for security.
      flash('success', 'Logged out and deleted local information');
      $window.localStorage.clear();
      $state.go('home');
      console.log('UserController -> logOut');
    };


    $scope.register = function register(fullname, email, password, passwordConfirm) {
      console.log('UserController -> register');
      if (AuthenticationService.isAuthenticated) {
        console.log('Register -> Already logged in!'); 
        flash('alert', 'Already logged in!');
      }
      else {
        UserService.register(fullname, email, password, passwordConfirm).success(function(feedback) {

          if (feedback.message === 'Validation failed') {

            console.log('UserController -> register failed');

            // Create a json array for feedback to the user
            var err = feedback.errors;
            var msg = [];
            for (var key in err) {
              if (err.hasOwnProperty(key)) {
                var f = {};
                f.level = "warning";
                //f.text = err[key].path.capitalize() + ' ' + err[key].type;
                f.text = err[key].message.replace('Path','Value');
              }
              msg.push (f);
            }

            flash(msg);

          }
          else {
            console.log('UserController -> register success');
            flash('succes', 'Thanks for registering, you can login now');
            $state.go('signin');
          }

        }).error(function(status, data) {

          flash('alert', 'Something went wrong with registration');
          console.log("Signin status: " + status);

        });
      }
    };
  }
]);
 
