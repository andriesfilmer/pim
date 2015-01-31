
var appServices = angular.module('appServices', []);
var appControllers = angular.module('appControllers', []);
var appDirectives = angular.module('appDirectives', []);
var app = angular.module('app', [
                                 'ui.router', 
                                 'ui.calendar',
                                 'ngTouch',
                                 'ngAnimate',
                                 'appControllers',
                                 'appServices',
                                 'appDirectives'
]);

var options = {};
options.api = {};
// Development
options.api.base_url = "http://test.filmer.net:3001";
// Production
//options.api.base_url = "http://api.filmer.nl";

app.config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/calendar/month");
  //
  // Now set up the states
  $stateProvider
    .state('home', {
       url: "/home",
       templateUrl: "partials/home.html",
       access: { requiredAuthentication: false }
     })
    .state('user', {
      url: "/user",
      templateUrl: 'partials/user.html',
      controller: 'UserController',
      access: { requiredAuthentication: false }
    })
    .state('signup', {
      url: "/signup",
      templateUrl: 'partials/signup.html',
      controller: 'UserController',
      access: { requiredAuthentication: false }
    })
    .state('signin', {
      url: "/signin",
      templateUrl: 'partials/signin.html',
      controller: 'UserController',
      access: { requiredAuthentication: false }
    })
    .state('user.logout', {
      url: "/logout",
      templateUrl: 'partials/user.logout.html',
      controller: 'UserController',
      access: { requiredAuthentication: true }
    })
    .state('contact', {
       url: "/contact",
       templateUrl: "partials/contact.html",
       access: { requiredAuthentication: true }
     })
    .state('calendar', {
       url: "/calendar",
       templateUrl: "partials/calendar.html",
       access: { requiredAuthentication: true }
     })
    .state('calendar.search', {
      url: "/search",
      templateUrl: "partials/calendar.search.html",
      controller: "CalendarController",
      access: { requiredAuthentication: true }
    })
    .state('calendar.month', {
      url: "/month?start",
      templateUrl: "partials/calendar.month.html",
      controller: "CalendarController",
      access: { requiredAuthentication: false }
    })
    .state('calendar.event/:id', {
      url: "/event/:id",
      templateUrl: "partials/calendar.event.html",
      controller: "EventController",
      access: { requiredAuthentication: true }
    })
    .state('calendar.event', {
      url: "/event?id&start",
      templateUrl: "partials/calendar.event.html",
      controller: "EventController",
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
    .state('reload', {
      url: "/reload",
      templateUrl: 'partials/reload.html',
      access: { requiredAuthentication: false }
    })
  }
]);

app.config(function ($httpProvider) {
   $httpProvider.interceptors.push('TokenInterceptor');
});

app.run(function ($rootScope, $state, $location, flash, AuthenticationService) {

  // Because we use token based authentication with te first page load 
  // we don't have 'AuthenticationService.isAuthenticated' true.
  if (!$rootScope.reloadAuthenticated) {
    console.log('App reloaded'); 
    flash('App reloaded');
    $rootScope.reloadAuthenticated = true;
    $location.path('/#/reload');
  }

  // Redirect only if both isAuthenticated is false and no token is set
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

    $rootScope.isAuthenticated = AuthenticationService.isAuthenticated;

    console.log('toSstate.access.requiredAuthentication: ' + toState.access.requiredAuthentication); 
    console.log('AuthenticationService.isAuthenticated ' + AuthenticationService.isAuthenticated); 

    if (toState.access.requiredAuthentication && !AuthenticationService.isAuthenticated) {
      flash('alert-box alert', 'Login first');
      event.preventDefault();
      $state.go('signin');
    }
    console.log('StateChange -> ' + toState.name); 
  });



});
