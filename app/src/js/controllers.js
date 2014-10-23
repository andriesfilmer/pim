appControllers.controller('CalendarListCtrl', ['$scope', function($scope) {
  $scope.greeting = 'Calendar controller....';
}]);
appControllers.controller('BookmarkListCtrl', ['$scope', function($scope) {
  $scope.greeting = 'Bookmarks controller....';
}]);

appControllers.controller('PostListCtrl', ['$scope', '$sce', 'PostService',
  function PostListCtrl($scope, $sce, PostService) {

    $scope.posts = [];

    PostService.findAll().success(function(data) {
      $scope.posts = data;
    }).error(function(data, status) {
      console.log(status);
      console.log('Error PostService.findAll');
    });

    $scope.updatePublicState = function updatePublicState(post, makePublic) {
      if (post != undefined && makePublic != undefined) {

        PostService.changePublicState(post._id, makePublic).success(function(data) {
          var posts = $scope.posts;
          for (var postKey in posts) {
            if (posts[postKey]._id == post._id) {
              $scope.posts[postKey].is_published = makePublic;
              break;
            }
          }
        }).error(function(status, data) {
          console.log(status);
          console.log(data);
        });
      }
    }
  }
]);

appControllers.controller('PostCreateCtrl', ['$scope', '$location', 'PostService',
  function PostCreateCtrl($scope, $location, PostService) {

    $scope.editForm = false; // Show editFrom, toggle first.
    $scope.saveForm = false; // Show save icon, $scope.change first.
    $scope.toggleForm = function () {
      $scope.editForm = !$scope.editForm;
    };

    $scope.change = function() {
        $scope.saveForm = true;
    };

    $scope.save = function save(post) {
      if (post != undefined) {

        // String comma separated to array
        //if (Object.prototype.toString.call(post.tags) !== '[object Array]') {
        // post.tags = post.tags.split(',');
        //}

        PostService.create(post).success(function(data) {
           $location.path("/kb");
        }).error(function(status, data) {
          console.log(status);
          console.log(data);
        });
      }
    }
  }
]);

appControllers.controller('PostEditCtrl', ['$scope', '$routeParams', '$location', '$sce', 'PostService',
  function PostEditCtrl($scope, $routeParams, $location, $sce, PostService) {

    $(document).foundation();

    $scope.editForm = true;  // Hide editFrom, toggle first.
    $scope.saveForm = false; // Hide save icon, $scope.change first.
    $scope.toggleForm = function () {
      $scope.editForm = !$scope.editForm;
    };

    $scope.change = function() {
        $scope.saveForm = true;
    };

    $scope.post = {};
    var id = $routeParams.id;

    PostService.read(id).success(function(data) {
      $scope.post = data;
      $scope.content = $sce.trustAsHtml(data.content);
    }).error(function(status, data) {
      console.log('Post read failure!'); 
      $location.path("/user/login");
    });

    $scope.save = function save(post) {
      if (post !== undefined && post.title !== undefined && post.title != "") {

        // String comma separated to array
        if (Object.prototype.toString.call(post.tags) !== '[object Array]') {
          post.tags = post.tags.split(',');
        }

        PostService.update(post).success(function(data) {
          console.log('Post updated success.'); 
          $('#postSettings').foundation('reveal', 'close');
          $location.path("/kb/");
        }).error(function(status, data) {
          console.log(status);
          console.log(data);
          $location.path("/user/login");
        });
      }
    }

    $scope.deletePost = function deletePost(post) {
      if (id != undefined) {
        PostService.delete(id).success(function(data) {
          console.log('Deleted post:' + post._id); 
          $('#postSettings').foundation('reveal', 'close');
          $location.path("/kb/");
        }).error(function(status, data) {
          console.log(status);
          console.log(data);
        });
      }
    }
  }
]);

appControllers.controller('UserCtrl', ['$scope', '$location', '$window', 'UserService', 'AuthenticationService',
  function UserCtrl($scope, $location, $window, UserService, AuthenticationService) {

    $scope.user = {
      username: $window.localStorage.username,
      password: $window.localStorage.password
    };

    $scope.signIn = function signIn(username, password) {
        if (username != null && password != null) {

            UserService.signIn(username, password).success(function(data) {
                AuthenticationService.isAuthenticated = true;
                $window.localStorage.username = username;
                $window.localStorage.password = password;
                $window.sessionStorage.token = data.token;
                $location.path("/kb/");
            }).error(function(status, data) {
                console.log(status);
                console.log(data);
            });
        }
    }

    $scope.logOut = function logOut() {
      AuthenticationService.isAuthenticated = false;
      delete $window.sessionStorage.token;
      delete $window.localStorage.username;
      delete $window.localStorage.password;
      $location.path("/");
    }

    $scope.register = function register(username, password, passwordConfirm) {
      console.log('UserCtrl -> register');
      if (AuthenticationService.isAuthenticated) {
        console.log('UserCtrl -> no redirect?');
        $location.path("/user/login");
      }
      else {
        UserService.register(username, password, passwordConfirm).success(function(data) {
          console.log('UserCtrl -> register success -> no redirect?');
        }).error(function(status, data) {
          console.log(status);
          console.log(data);
        });
      }
      $location.path("/user/login");
    } 
  }
]);

