appControllers.controller('UserController', ['$scope', '$state', '$stateParams', '$window', 'flash', 'UserService', 'AuthenticationService',
  function UserController($scope, $state, $stateParams, $window, flash, UserService, AuthenticationService) {

    // Capitalize function for feedback in falsh messages
    String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    };

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
              var f = {};
              if (err.hasOwnProperty(key)) {
                f.level = "warning";
                //f.text = err[key].path.capitalize() + ' ' + err[key].type;
                f.text = err[key].message.replace('Path','Value');
              }
              msg.push(f);
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


    $scope.sendPasswordChangeToken = function sendPasswordChangeToken(email) {
      UserService.sendToken(email).success(function(feedback) {
        if (feedback.error) {
          console.log('UserController -> sendToken failed');
          $scope.tokenSend = false;
          flash('alert', feedback.error.message);
        }
        else {
          console.log('UserController -> sendtoken success');
          // View state before/after ('ng-hide/ng-show') sending email message.
          $scope.tokenSend = true;
          flash('succes', 'E-mail message send');
        }
      }).error(function(status, data) {
        console.log("SendToken status: " + status);
        $scope.tokenSend = false;
        flash('alert', 'Some error occurred.');
      });
      $scope.tokenSend = true;
    };

    // Set 'token' from querystring for changePassword
    // which is send by API service token/link to users mailbox.
    if ($stateParams.token !== undefined) {
      $window.localStorage.token = $stateParams.token;
    }

    $scope.changePassword = function changePassword(password, passwordConfirm) {
      UserService.changePassword(password, passwordConfirm).success(function(feedback) {
        if (feedback.errors) {
          console.log('UserController -> password change failed');
          flash('alert', feedback.errors.password.message);
        }
        else {
          console.log('UserController -> password change success');
          flash('succes', 'Password has changed and you are logged-in');
          $state.go('home');
        }
      }).error(function(status, data) {
        console.log("Password change status: " + status);
        flash('alert', 'Authorisation failed');
      });
    };

  }
]);
 
