appControllers.controller('CalendarCtrl', ['$scope', function($scope) {
  $scope.greeting = 'Calendar controller....';
}]);

appControllers.controller('BookmarkCtrl', ['$scope', function($scope) {
  $scope.greeting = 'Bookmark controller....';
}]);

appControllers.controller('PostListCtrl', ['$rootScope', '$scope', '$location', '$window', 'PostService', 
  function PostListCtrl($rootScope, $scope, $location, $window, PostService) {

  "use strict";

  $scope.searchForm = true;  // Hide searchFrom, toggle first.
  $scope.toggleSearch = function () {
    $scope.searchForm = !$scope.searchForm;
    $scope.searchKey =  $window.sessionStorage.postSearchKey;
  };

  $scope.posts = [];

  PostService.findAll().success(function(data) {
    $scope.posts = data;
    $window.localStorage.postsAll = JSON.stringify(data);
  }).error(function(data, status) {
    console.log(status);
    status = 0; // online - offline
    console.log('postsAll error');
    if(status === 0 ) {
      $rootScope.online = false;
      if($window.localStorage.getItem('postsAll') !== null) {
        console.log('postsAll from localstorage');
        $scope.posts = JSON.parse($window.localStorage.postsAll);
      }
    }
  });

  $scope.$watch('searchKey', function(searchKey) {
      if (searchKey !== undefined && searchKey.length >= 3) {
        $window.sessionStorage.postSearchKey = searchKey;
        PostService.searchAll(searchKey).success(function(data) {
          $scope.posts = data;
        }).error(function(data, status) {
          console.log(status);
          console.log('Posts search error');
          if(status === 0) {
            console.log('Posts search notting found');
          } 
        }); 
      }
  });

  $scope.updatePublicState = function updatePublicState(post, makePublic) {
    if (post !== undefined && makePublic !== undefined) {

      PostService.changePublicState(post._id, makePublic).success(function(data) {
        var posts = $scope.posts;
        for (var postKey in posts) {
          if (posts[postKey]._id == post._id) {
            $scope.posts[postKey].public = makePublic;
            break;
          }
        }
      }).error(function(status, data) {
        console.log(status);
        console.log(data);
      });
    }
  };
}
]);

appControllers.controller('PostCtrl', ['$rootScope', '$scope', '$window', '$routeParams', '$location', 'PostService', 
  function PostCtrl($rootScope, $scope, $window, $routeParams, $location, PostService) {

    $(document).foundation();

    $scope.searchForm = true;  // Hide searchFrom, toggle first.
    $scope.toggleSearch = function () {
      $scope.searchForm = !$scope.searchForm;
    };

    $scope.saveForm = false; // Hide save icon, $scope.change first.
    $scope.toggleForm = function () {
      $scope.editForm = !$scope.editForm;
    };

    $scope.change = function() {
        $scope.saveForm = true;
    };

    $scope.post = {};
    var id = $routeParams.id;

    if (id !== undefined) {
      PostService.read(id).success(function(data) {
        $scope.post = data;
        $window.localStorage['post_' + id] = JSON.stringify(data);
      }).error(function(status, data) {
        console.log('Post read failure!'); 
        console.log('Status: ' + status);
        status = 0; // Test online - offline
        if(status === 0 && $window.localStorage.getItem('post_' + id) !== null) {
          $rootScope.online = false;
          $scope.post = JSON.parse($window.localStorage['post_' + id]);
          console.log('Post from localstorage id: ' + id);
        } else {
          console.log('No post from localstorage id: ' + id);
        }
      });
    } else {
      $scope.editForm = true;  // Hide editFrom, toggle first.
    }

    $scope.save = function save(post) {
      if (post !== undefined && post.title !== undefined && post.title !== "") {

        // String comma separated to array
        if (post.tags !== undefined && Object.prototype.toString.call(post.tags) !== '[object Array]') {
          post.tags = post.tags.split(',');
        }
        if (post._id !== undefined) {
          PostService.update(post).success(function(data) {
            $('#post-settings').foundation('reveal', 'close');
            $location.path("/post");
            console.log('Post updated success.'); 
          }).error(function(status, data) {
            console.log(status);
            console.log(data);
            $location.path("/user/login");
          });
        } else {
          PostService.create(post).success(function(data) {
             $location.path("/post");
          }).error(function(status, data) {
            if(status === 0) {
              $rootScope.online = false;
            }
            console.log(status);
            console.log(data);
          });
        }
      }
    };

    $scope.deletePost = function deletePost(post) {
      if (id !== undefined) {
        PostService.delete(id).success(function(data) {
          console.log('Deleted post:' + post._id); 
          $('#post-settings').foundation('reveal', 'close');
          $location.path("/post");
        }).error(function(status, data) {
          console.log(status);
          console.log(data);
        });
      }
    };
  }
]);
appControllers.controller('UserCtrl', ['$scope', '$location', '$window', 'UserService', 'AuthenticationService',
  function UserCtrl($scope, $location, $window, UserService, AuthenticationService) {

    $scope.signIn = function signIn(username, password) {
      if (username !== null && password !== null) {

        UserService.signIn(username, password).success(function(data) {
            AuthenticationService.isAuthenticated = true;
            // We choose localStorage i.o. sessionStorage so that 
            // we keep content after clossing the browser.
            $window.localStorage.token = data.token;
            $location.path("/post");
        }).error(function(status, data) {
            console.log(status);
            console.log(data);
        });
      }
    };

    $scope.logOut = function logOut() {
      AuthenticationService.isAuthenticated = false;
      // We have logout so we delete localstore for security.
      $window.localStorage.clear();
      $location.path("/user/login");
      console.log('UserCtrl -> logOut');
    };

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
    };
  }
]);

