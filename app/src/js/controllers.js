appControllers.controller('CalendarController', ['$scope', function($scope) {
  $scope.greeting = 'Calendar controller....';
  $scope.calendarItems = ["item 1","item 2","item 3","item 4"];

}]);

appControllers.controller('BookmarkController', ['$scope', function($scope) {
  $scope.greeting = 'Bookmark controller....';
  $scope.bookmarks = ["bookmark 1","bookmark 2","bookmark 3","bookmark 4"];
}]);

appControllers.controller('PostListController', ['$rootScope', '$scope', '$location', '$window', 'PostService', 
  function PostListController($rootScope, $scope, $location, $window, PostService) {

  $scope.searchForm = false;  // Hide searchFrom, toggle first.
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

appControllers.controller('PostController', ['$rootScope', '$scope', '$state' ,'$window', '$stateParams', '$location', 'PostService', 
  function PostController($rootScope, $scope, $state, $window, $stateParams, $location, PostService) {

    $(document).foundation();

    $scope.saveForm = false; // Hide save icon, $scope.change first.
    $scope.toggleForm = function () {
      $scope.editForm = !$scope.editForm;
    };

    $scope.change = function() {
        $scope.saveForm = true;
    };

    $scope.post = {};
    var id = $stateParams.id;

    if ($stateParams.id.length > 23) {
      PostService.read(id).success(function(data) {
        $scope.post = data;
        $window.localStorage['post_' + id] = JSON.stringify(data);
      }).error(function(status, data) {
        console.log('Post read failure!'); 
        console.log('Status: ' + status);
        if(status === 0 && $window.localStorage.getItem('post_' + id) !== null) {
          $rootScope.online = false;
          $scope.post = JSON.parse($window.localStorage['post_' + id]);
          console.log('Post from localstorage id: ' + id);
        } else {
          console.log('No post from localstorage id: ' + id);
        }
      });
    }

    if ($stateParams.id === "create") {
      $scope.editForm = true;  // Hide editFrom, toggle first.
    }

    $scope.save = function save(post) {

      if (post !== undefined && post.title !== undefined && post.title !== "") {

        $('a.close-reveal-modal').trigger('click');

        // String comma separated to array
        if (post.tags !== undefined && Object.prototype.toString.call(post.tags) !== '[object Array]') {
          post.tags = post.tags.split(',');
        }
        if (post._id !== undefined) {
          PostService.update(post).success(function(data) {
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
        $('a.close-reveal-modal').trigger('click');
        PostService.delete(id).success(function(data) {
          console.log('Deleted post:' + post._id); 
          $location.path("/post");
        }).error(function(status, data) {
          console.log(status);
          console.log(data);
        });
      }
    };
  }
]);

appControllers.controller('UserController', ['$scope', '$location', '$window', 'UserService', 'AuthenticationService',
  function UserController($scope, $location, $window, UserService, AuthenticationService) {

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
      console.log('UserController -> logOut');
    };

    $scope.register = function register(username, password, passwordConfirm) {
      console.log('UserController -> register');
      if (AuthenticationService.isAuthenticated) {
        console.log('UserController -> no redirect?');
        $location.path("/user");
      }
      else {
        UserService.register(username, password, passwordConfirm).success(function(data) {
          console.log('UserController -> register success -> no redirect?');
        }).error(function(status, data) {
          console.log(status);
          console.log(data);
        });
      }
      $location.path("/user/login");
    };
  }
]);

