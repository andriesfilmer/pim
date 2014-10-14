'use strict';

var app = angular.module('app', ['ngRoute', 'appControllers', 'appServices', 'appDirectives','btford.markdown']);

var appServices = angular.module('appServices', []);
var appControllers = angular.module('appControllers', []);
var appDirectives = angular.module('appDirectives', []);

var options = {};
options.api = {};
options.api.base_url = "http://test.filmer.net:3001";


app.config(['$locationProvider', '$routeProvider', 
  function($location, $routeProvider) {
    $routeProvider.
      when('/kb', {
        templateUrl: 'partials/kb.list.html',
        controller: 'PostListCtrl',
        access: { requiredAuthentication: true }
      }).
      when('/kb/create', {
        templateUrl: 'partials/kb.create.html',
        controller: 'PostCreateCtrl',
        access: { requiredAuthentication: true }
      }).
      when('/kb/:id', {
        templateUrl: 'partials/kb.view.html',
        controller: 'PostEditCtrl'
      }).
      when('/user/register', {
        templateUrl: 'partials/admin.register.html',
        controller: 'UserCtrl'
      }).
      when('/user/login', {
        templateUrl: 'partials/admin.signin.html',
        controller: 'UserCtrl'
      }).
      when('/user/logout', {
        templateUrl: 'partials/admin.logout.html',
        controller: 'UserCtrl',
        access: { requiredAuthentication: true }
      }).
      otherwise({
        redirectTo: '/'
      });
  }
]);

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('TokenInterceptor');
});

app.run(function($rootScope, $location, $window, AuthenticationService) {

  $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {

    // Redirect only if both isAuthenticated is false and no token is set
    if (nextRoute != null && 
        nextRoute.access != null && 
        nextRoute.access.requiredAuthentication && 
        !AuthenticationService.isAuthenticated && 
        !$window.sessionStorage.token) {
          $location.path("/admin/login");
     }

  });

});

appControllers.controller('PostListCtrl', ['$scope', '$sce', 'PostService',
  function PostListCtrl($scope, $sce, PostService) {

    $scope.posts = [];

    PostService.findAll().success(function(data) {
      $scope.posts = data;
    }).error(function(data, status) {
      console.log(status);
      console.log('Error PostService.findAll');
    });

    $scope.updatePublishState = function updatePublishState(post, shouldPublish) {
      if (post != undefined && shouldPublish != undefined) {

        PostService.changePublishState(post._id, shouldPublish).success(function(data) {
          var posts = $scope.posts;
          for (var postKey in posts) {
            if (posts[postKey]._id == post._id) {
              $scope.posts[postKey].is_published = shouldPublish;
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

    $scope.save = function save(post, shouldPublish) {
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

    //$scope.save = function save(post, shouldPublish) {
    $scope.save = function save(post) {
      if (post !== undefined && post.title !== undefined && post.title != "") {

        // String comma separated to array
        if (Object.prototype.toString.call(post.tags) !== '[object Array]') {
          post.tags = post.tags.split(',');
        }

        PostService.update(post).success(function(data) {
          console.log('Post updated success.'); 
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
    console.log('UserCtrl');

    // User Controller (signIn, logOut)
    $scope.signIn = function signIn(username, password) {
        console.log('UserCtrl: Signin');
        if (username != null && password != null) {

            UserService.signIn(username, password).success(function(data) {
                AuthenticationService.isAuthenticated = true;
                $window.sessionStorage.token = data.token;
                $location.path("/kb/");
            }).error(function(status, data) {
                console.log(status);
                console.log(data);
            });
        }
    }

    $scope.logOut = function logOut() {
      console.log('UserCtrl -> logOut -> delete sessionStorage.token.');
      AuthenticationService.isAuthenticated = false;
      delete $window.sessionStorage.token;
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
      console.log('UserCtrl -> redirect user/login');
      $location.path("/user/login");
    } 
  }
]);


appDirectives.directive('displayMessage', function() {
  return {
	restrict: 'E',
	scope: {
       	messageType: '=type',
       	message: '=data'
    },
    template: '<div class="alert {{messageType}}">{{message}}</div>',
    link: function (scope, element, attributes) {
      scope.$watch(attributes, function (value) {
        console.log(attributes);
        console.log(value);
        console.log(element[0]);
        element[0].children.hide(); 
      });
    }
  }
});

// Update the tags model with user input and comma delimited data.
appDirectives.directive('myTags', function($parse) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attrs, ngModelCtrl) {
          ngModelCtrl.$viewChangeListeners.push(function(){
             $parse(attrs.ngModel).assign(scope, ngModelCtrl.$viewValue.split(','));
          });
         }
    }
});;

// <input type="checkbox" ng-model="foo.bar" bs-switch>
appDirectives.directive('bsSwitch', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ngModelCtrl) {
      $(element).bootstrapSwitch({
        onSwitchChange: function(event, state) {
          scope.$apply(function() {
            console.log('##### test -> dir..'); 
            ngModelCtrl.$setViewValue(state);
          });
        }
      });
    }
  }
});


appServices.factory('AuthenticationService', function() {
  var auth = {isAuthenticated: false }
  return auth;
});


appServices.factory('TokenInterceptor', function ($q, $window, $location, AuthenticationService) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      if ($window.sessionStorage.token) {
        config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
      }
      return config;
    },

    requestError: function(rejection) {
      return $q.reject(rejection);
    },

    /* Set Authentication.isAuthenticated to true if 200 received */
    response: function (response) {
      console.log('TokenInterceptor check authenticated'); 
      if (response != null && response.status == 200 && $window.sessionStorage.token && !AuthenticationService.isAuthenticated) {
        AuthenticationService.isAuthenticated = true;
        console.log('TokenInterceptor is authenticated'); 
      }
      return response || $q.when(response);
    },

    /* Revoke client authentication if 401 is received */
    responseError: function(rejection) {
      //if (rejection != null && rejection.status === 401 && ($window.sessionStorage.token || AuthenticationService.isAuthenticated)) {
      if (rejection.status === 401) {
        delete $window.sessionStorage.token;
        AuthenticationService.isAuthenticated = false;
        console.log('TokenInterceptor -> rejection -> 401'); 
        $location.path("/user/login");
      }
      return $q.reject(rejection);
    }
  };
});

appServices.factory('PostService', function($http, $location) {
  return {
    read: function(id) {
      return $http.get(options.api.base_url + '/post/' + id);
    },

    findAll: function() {
      return $http.get(options.api.base_url + '/post/all')
      .error(function(data, status, headers, config) {
        console.log('Not authorized (findAll)'); 
        $location.path("/user/login");
      });
    },

    changePublishState: function(id, newPublishState) {
      return $http.put(options.api.base_url + '/post', {'post': {_id: id, is_published: newPublishState}});
    },

    delete: function(id) {
      return $http.delete(options.api.base_url + '/post/' + id);
    },

    create: function(post) {
      return $http.post(options.api.base_url + '/post', {'post': post});
    },

    update: function(post) {
      return $http.put(options.api.base_url + '/post', {'post': post});
    },

  };
});

appServices.factory('UserService', function ($http) {
  return {
    signIn: function(username, password) {
      return $http.post(options.api.base_url + '/user/signin', {username: username, password: password});
    },

    register: function(username, password, passwordConfirmation) {
      return $http.post(options.api.base_url + '/user/register', {username: username, password: password, passwordConfirmation: passwordConfirmation });
    }
  }
});

