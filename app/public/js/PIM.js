'use strict';

var app = angular.module('app', ['ngRoute', 'appControllers', 'appServices', 'appDirectives','btford.markdown']);

var appServices = angular.module('appServices', []);
var appControllers = angular.module('appControllers', []);
var appDirectives = angular.module('appDirectives', []);

var options = {};
options.api = {};
options.api.base_url = "http://localhost:3001";


app.config(['$locationProvider', '$routeProvider', 
  function($location, $routeProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'partials/post.list.html',
            controller: 'PostListCtrl'
        }).
        when('/post/:id', {
            templateUrl: 'partials/post.view.html',
            controller: 'AdminPostEditCtrl',
            //controller: 'PostViewCtrl'
        }).
        when('/tag/:tagName', {
            templateUrl: 'partials/post.list.html',
            controller: 'PostListTagCtrl'
        }).
        when('/admin', {
            templateUrl: 'partials/admin.post.list.html',
            controller: 'AdminPostListCtrl',
            access: { requiredAuthentication: true }
        }).
        when('/admin/post/create', {
            templateUrl: 'partials/admin.post.create.html',
            controller: 'AdminPostCreateCtrl',
            access: { requiredAuthentication: true }
        }).
        when('/admin/post/edit/:id', {
            templateUrl: 'partials/admin.post.edit.html',
            controller: 'AdminPostEditCtrl',
            access: { requiredAuthentication: true }
        }).
        when('/admin/register', {
            templateUrl: 'partials/admin.register.html',
            controller: 'AdminUserCtrl'
        }).
        when('/admin/login', {
            templateUrl: 'partials/admin.signin.html',
            controller: 'AdminUserCtrl'
        }).
        when('/admin/logout', {
            templateUrl: 'partials/admin.logout.html',
            controller: 'AdminUserCtrl',
            access: { requiredAuthentication: true }
        }).
        otherwise({
            redirectTo: '/'
        });
}]);


app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('TokenInterceptor');
});

app.run(function($rootScope, $location, $window, AuthenticationService) {
    $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
        // Redirect only if both isAuthenticated is false and no token is set
        if (nextRoute != null && nextRoute.access != null && nextRoute.access.requiredAuthentication 
            && !AuthenticationService.isAuthenticated && !$window.sessionStorage.token) {

            $location.path("/admin/login");
        }
    });
});

appControllers.controller('PostListCtrl', ['$scope', '$sce', 'PostService',
  function PostListCtrl($scope, $sce, PostService) {

    $scope.posts = [];

    PostService.findAllPublished().success(function(data) {
      for (var postKey in data) {
        data[postKey].content = $sce.trustAsHtml(data[postKey].content);
      }

      $scope.posts = data;
    }).error(function(data, status) {
      console.log(status);
      console.log(data);
    });
  }
]);

//appControllers.controller('PostViewCtrl', ['$scope', '$routeParams', '$location', '$sce', 'PostService',
//    function PostViewCtrl($scope, $routeParams, $location, $sce, PostService) {
//
//        $scope.post = {};
//        var id = $routeParams.id;
//
//        PostService.read(id).success(function(data) {
//            //data.content = $sce.trustAsHtml(data.content);
//            data.content.htmlSafe = $sce.trustAsHtml(data.content);
//            $scope.post = data;
//        }).error(function(data, status) {
//            console.log(status);
//            console.log(data);
//        });
//
//    }
//]);


appControllers.controller('AdminPostListCtrl', ['$scope', 'PostService', 
    function AdminPostListCtrl($scope, PostService) {
        $scope.posts = [];

        PostService.findAll().success(function(data) {
            $scope.posts = data;
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


        $scope.deletePost = function deletePost(id) {
            if (id != undefined) {

                PostService.delete(id).success(function(data) {
                    var posts = $scope.posts;
                    for (var postKey in posts) {
                        if (posts[postKey]._id == id) {
                            $scope.posts.splice(postKey, 1);
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

appControllers.controller('AdminPostCreateCtrl', ['$scope', '$location', 'PostService',
    function AdminPostCreateCtrl($scope, $location, PostService) {

        $scope.save = function save(post, shouldPublish) {
            if (post != undefined 
                && post.title != undefined
                && post.tags != undefined) {

                var content = $('#textareaContent').val();
                if (content != undefined) {
                    post.content = content;

                    if (shouldPublish != undefined && shouldPublish == true) {
                        post.is_published = true;
                    } else {
                        post.is_published = false;
                    }

                    PostService.create(post).success(function(data) {
                        $location.path("/admin");
                    }).error(function(status, data) {
                        console.log(status);
                        console.log(data);
                    });
                }
            }
        }
    }
]);

appControllers.controller('AdminPostEditCtrl', ['$scope', '$routeParams', '$location', '$sce', 'PostService',
  function AdminPostEditCtrl($scope, $routeParams, $location, $sce, PostService) {

    $scope.editForm = true;  // Hide editFrom on toggle first
    $scope.saveForm = false; // Show save icon
    $scope.toggleForm = function () {
      $scope.editForm = !$scope.editForm;
      if ($scope.dbTitle !== $('#inputTitle').val() ||
          $scope.dbContent.toString() !== $('#textareaContent').val() ||
          $scope.dbTags.toString() !== $('#inputTags').val()) {
        $scope.saveForm = true;
      }
    };

    $scope.post = {};
    var id = $routeParams.id;

    PostService.read(id).success(function(data) {
      $scope.post = data;

      // Set db values so we can check if its changed.
      //
      $scope.dbTitle   = data.title;
      $scope.dbContent = $sce.trustAsHtml(data.content);
      $scope.dbTags    = data.tags;

      $('#inputTitle').val($scope.dbTitle);
      $('#textareaContent').val($scope.dbContent);
      $('#inputTags').val($scope.dbTags);

    }).error(function(status, data) {
      console.log('Post read failure!'); 
      $location.path("/admin");
    });

    $scope.save = function save(post, shouldPublish) {
      if (post !== undefined && post.title !== undefined && post.title != "") {

        var content = $('#textareaContent').val();
        if (content !== undefined && content != "") {
          post.content = content;
        }

        // String comma separated to array
        if (Object.prototype.toString.call(post.tags) !== '[object Array]') {
          post.tags = post.tags.split(',');
          //post.tags = $('#inputTags').val().split(',');
        }

        PostService.update(post).success(function(data) {
          console.log('Post updated success.'); 
          $location.path("/admin/post");
        }).error(function(status, data) {
           console.log(status);
           console.log(data);
        });
      }
    }
  }
]);

appControllers.controller('AdminUserCtrl', ['$scope', '$location', '$window', 'UserService', 'AuthenticationService',  
    function AdminUserCtrl($scope, $location, $window, UserService, AuthenticationService) {
        console.log('AdminUserCtrl');

        //Admin User Controller (signIn, logOut)
        $scope.signIn = function signIn(username, password) {
            console.log('AdminUserCtrl: Signin');
            if (username != null && password != null) {

                UserService.signIn(username, password).success(function(data) {
                    AuthenticationService.isAuthenticated = true;
                    $window.sessionStorage.token = data.token;
                    $location.path("/admin");
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }

        $scope.logOut = function logOut() {
          console.log('AdminUserCtrl -> logOut -> delete sessionStorage.token.');
          AuthenticationService.isAuthenticated = false;
          delete $window.sessionStorage.token;
          $location.path("/");
        }

        $scope.register = function register(username, password, passwordConfirm) {
          console.log('AdminUserCtrl -> register');
          if (AuthenticationService.isAuthenticated) {
            console.log('AdminUserCtrl -> no redirect?');
            $location.path("/admin");
          }
          else {
            UserService.register(username, password, passwordConfirm).success(function(data) {
              console.log('AdminUserCtrl -> register success -> no redirect?');
            }).error(function(status, data) {
              console.log(status);
              console.log(data);
            });
          }
          console.log('AdminUserCtrl -> redirect admin/login');
          $location.path("/admin/login");
        } 
    }
]);


appControllers.controller('PostListTagCtrl', ['$scope', '$routeParams', '$sce', 'PostService',
    function PostListTagCtrl($scope, $routeParams, $sce, PostService) {

        $scope.posts = [];
        var tagName = $routeParams.tagName;

        PostService.findByTag(tagName).success(function(data) {
            for (var postKey in data) {
                data[postKey].content = $sce.trustAsHtml(data[postKey].content);
            }
            $scope.posts = data;
        }).error(function(status, data) {
            console.log(status);
            console.log(data);
        });

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


appServices.factory('AuthenticationService', function() {
  var auth = {
    isAuthenticated: false,
    isAdmin: false
  }

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
      //console.log('TokenInterceptor check authenticated'); 
      if (response != null && response.status == 200 && $window.sessionStorage.token && !AuthenticationService.isAuthenticated) {
        AuthenticationService.isAuthenticated = true;
        //console.log('TokenInterceptor is authenticated'); 
      }
      return response || $q.when(response);
    },

    /* Revoke client authentication if 401 is received */
    responseError: function(rejection) {
      if (rejection != null && rejection.status === 401 && ($window.sessionStorage.token || AuthenticationService.isAuthenticated)) {
        delete $window.sessionStorage.token;
        AuthenticationService.isAuthenticated = false;
        console.log('TokenInterceptor -> authenticated revoked'); 
        $location.path("/admin/login");
      }

      return $q.reject(rejection);
    }
  };
});

appServices.factory('PostService', function($http) {
  return {
    findAllPublished: function() {
      return $http.get(options.api.base_url + '/post');
    },

    findByTag: function(tag) {
      return $http.get(options.api.base_url + '/tag/' + tag);
    },

    read: function(id) {
      return $http.get(options.api.base_url + '/post/' + id);
    },
    
    findAll: function() {
      return $http.get(options.api.base_url + '/post/all');
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

