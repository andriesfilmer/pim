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
