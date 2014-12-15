
var appServices = angular.module('appServices', []);
var appControllers = angular.module('appControllers', []);
var appDirectives = angular.module('appDirectives', []);
var app = angular.module('app', ['ui.router' ,'appControllers', 'appServices', 'appDirectives']);

var options = {};
options.api = {};
// Development
options.api.base_url = "http://test.filmer.net:3001";
// Production
//options.api.base_url = "http://api.filmer.nl";

app.config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/post");
  //
  // Now set up the states
  $stateProvider
   .state('calendar', {
      url: "/calendar",
      templateUrl: "partials/calendar.html",
      access: { requiredAuthentication: true }
    })
    .state('calendar.list', {
      url: "/list",
      templateUrl: "partials/calendar.list.html",
      controller: "CalendarController",
      access: { requiredAuthentication: true }
    })
    .state('bookmark', {
      url: "/bookmark",
      templateUrl: "partials/bookmark.html",
      access: { requiredAuthentication: true }
    })
    .state('bookmark.list', {
      url: "/list",
      templateUrl: "partials/bookmark.list.html",
      controller: "BookmarkController",
      access: { requiredAuthentication: true }
    })
    .state('post', {
      url: "/post",
      templateUrl: "partials/post.list.html",
      controller: 'PostListController',
      access: { requiredAuthentication: true }
    })
    .state('post.create', {
      url: "/post/create",
      templateUrl: "partials/post.view.html",
      controller: 'PostController',
      access: { requiredAuthentication: true }
    })
    .state('post/:id', {
      url: "/post/:id",
      templateUrl: "partials/post.view.html",
      controller: 'PostController',
      access: { requiredAuthentication: true }
    })
    .state('user', {
      url: "/user",
      templateUrl: 'partials/user.html',
      controller: 'UserController',
      access: { requiredAuthentication: true }
    })
    .state('user.register', {
      url: "/register",
      templateUrl: 'partials/user.register.html',
      controller: 'UserController',
      access: { requiredAuthentication: false }
    })
    .state('user.signin', {
      url: "/login",
      templateUrl: 'partials/user.signin.html',
      controller: 'UserController',
      access: { requiredAuthentication: false }
    })
    .state('user.logout', {
      url: "/logout",
      templateUrl: 'partials/user.logout.html',
      controller: 'UserController',
      access: { requiredAuthentication: true }
    })
    .state('offline', {
      url: "/offline",
      templateUrl: 'partials/offline.html',
      access: { requiredAuthentication: false }
    })
  }
]);

app.config(function ($httpProvider) {
   $httpProvider.interceptors.push('TokenInterceptor');
});

app.run(function ($rootScope, $state, $location, AuthenticationService) {

  // Redirect only if both isAuthenticated is false and no token is set
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

    //$rootScope.online = true; // Testing on/offline
    console.log('##### test -> toSstate.access.requiredAuthentication: ' + toState.access.requiredAuthentication); 
    console.log('##### test -> AuthenticationService.isAuthenticated ' + AuthenticationService.isAuthenticated); 

    if (toState.access.requiredAuthentication && !AuthenticationService.isAuthenticated) {
      $state.go('user.signin');
      event.preventDefault();
    }
    console.log('##### StateChange -> ' + toState.name); 
  });

});
