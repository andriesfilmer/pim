'use strict';

var app = angular.module('app', ['ngRoute', 'appControllers', 'appServices', 'appDirectives']);

var appServices = angular.module('appServices', []);
var appControllers = angular.module('appControllers', []);
var appDirectives = angular.module('appDirectives', ['btford.markdown']);

var options = {};
options.api = {};
// Development
options.api.base_url = "http://test.filmer.net:3001";
// Production
//options.api.base_url = "http://api.filmer.nl";



app.config(['$locationProvider', '$routeProvider', 
  function($location, $routeProvider) {
    $routeProvider.
      when('/calendar', {
        templateUrl: 'partials/calendar.list.html',
        controller: 'CalendarListCtrl',
        access: { requiredAuthentication: true }
      }).
      when('/post', {
        templateUrl: 'partials/post.list.html',
        controller: 'PostListCtrl',
        access: { requiredAuthentication: true }
      }).
      when('/post/create', {
        templateUrl: 'partials/post.view.html',
        controller: 'PostCreateCtrl',
        access: { requiredAuthentication: true }
      }).
      when('/post/:id', {
        templateUrl: 'partials/post.view.html',
        controller: 'PostEditCtrl'
      }).
      when('/bookmark', {
        templateUrl: 'partials/bookmark.list.html',
        controller: 'BookmarkListCtrl',
        access: { requiredAuthentication: true }
      }).
      when('/user/register', {
        templateUrl: 'partials/user.register.html',
        controller: 'UserCtrl'
      }).
      when('/user/login', {
        templateUrl: 'partials/user.signin.html',
        controller: 'UserCtrl'
      }).
      when('/user/logout', {
        templateUrl: 'partials/user.logout.html',
        controller: 'UserCtrl',
        access: { requiredAuthentication: true }
      }).
      otherwise({
        redirectTo: '/post'
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
