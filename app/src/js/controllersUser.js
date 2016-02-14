appControllers.controller('UserController', ['$scope', '$timeout', '$state', '$stateParams', '$window', 'UserService',
                          'AuthenticationService', 'CalendarService', 'ContactService', 'PostService', 'BookmarkService', 'flash',
  function UserController($scope, $timeout, $state, $stateParams, $window, UserService,
                          AuthenticationService, CalendarService, ContactService, PostService, BookmarkService, flash) {

    // Capitalize function for feedback in falsh messages
    String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    };

    $scope.signIn = function signIn(email, password) {
      UserService.signIn(email, password).then(function(response) {
        AuthenticationService.isAuthenticated = true;
        $scope.loginForm = true;

        // We choose localStorage i.o. sessionStorage so that 
        // we keep the token after clossing the browser.
        $window.localStorage.token = response.data.token;
        $window.localStorage.user_id = response.data.user_id;

        //---------------------------------------------------------------------
        // After successfull login load some data for offline usage.
        //---------------------------------------------------------------------

        // Load next 6 months to localStorage.
        var m = ["0","1", "2", "3","4","5"];
        m.forEach(function(m) {
          var start = moment().startOf('month').add(m, 'M').format('YYYY-MM-DD');
          var end = moment().endOf('month').add(m, 'M').format('YYYY-MM-DD');
          var storeMonth = moment(start).format('YYYY-MM');
          CalendarService.find(start, end)
          .then(function(response) {
            $window.localStorage['events_' + storeMonth] = JSON.stringify(response.data);
            response.data.forEach(function(event) {
              CalendarService.read(event._id).then(function(event) {
                $window.localStorage['event_' + event._id] = JSON.stringify(event.data);
              });
            });
          });
        });

        ContactService.findAll(false, false ,'last_read' , 100)
        .then(function(response) {
          console.log('Loading last read contacts into localStorage'); 
          $window.localStorage.contactsAll = JSON.stringify(response.data);
          response.data.forEach(function(contact) {
            ContactService.read(contact._id).then(function(contact) {
              $window.localStorage['contact_' + contact._id] = JSON.stringify(contact.data);
            });
          });
        });

        PostService.findAll(100)
        .then(function(response) {
          console.log('Loading last updated posts into localStorage'); 
          $window.localStorage.postsAll = JSON.stringify(response.data);
          response.data.forEach(function(post) {
            PostService.read(post._id).then(function(post) {
              $window.localStorage['post_' + post._id] = JSON.stringify(post.data);
            });
          });
        });

        BookmarkService.findAll(100)
        .then(function(response) {
          console.log('Loading last updated bookmarkt into localStorage'); 
          $window.localStorage.bookmarksAll = JSON.stringify(response.data);
          response.data.forEach(function(bookmark) {
            BookmarkService.read(bookmark._id).then(function(bookmark) {
              $window.localStorage['bookmark_' + bookmark._id] = JSON.stringify(bookmark.data);
            });
          });
        });

        flash('success', 'Success: Loading some data for offline usage...');
        $timeout(function(){
          $state.go('home');
          flash('success', 'Signed in');
        }, 3000);

        //---------------------------------------------------------------------


      }, function(response) {
        if(response.status === 0) {
          flash('warning', 'Not online');
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
      flash('success', 'Logged out successfull');
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
        flash('success', response.data);
      }, function(response) {
        $scope.tokenSend = false;
        flash('alert', response.data);
      });

    };

    // Set 'token' from querystring for changePassword which
    // is send by API service token/link to users mailbox.
    if ($stateParams.token) {
      $window.localStorage.token = $stateParams.token;
    }

    $scope.changePassword = function changePassword(password, passwordConfirm) {
      UserService.changePassword(password, passwordConfirm).then(function(response) {
        flash('success', 'Password has changed and you are logged-in');

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

