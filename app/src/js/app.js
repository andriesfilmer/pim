var appServices = angular.module('appServices', []);
var appControllers = angular.module('appControllers', []);
var appDirectives = angular.module('appDirectives', []);
var app = angular.module('app', [
                                 'ui.router', 
                                 'ui.calendar',
                                 'ngTouch',
                                 'ngAnimate',
                                 'appConfig',
                                 'appControllers',
                                 'appServices',
                                 'appDirectives',
                                 'angularSpinner'
]);

var options = {};
options.api = {};

app.config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

  // For any unmatched url, redirect to /calendar/month
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
      access: { requiredAuthentication: true }
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

    .state('contact', {
      url: "/contact",
      templateUrl: "partials/contact.list.html",
      controller: 'ContactListController',
      access: { requiredAuthentication: true}
    })
    .state('contact.create', {
      url: "/contact/create",
      templateUrl: "partials/contact.view.html",
      controller: 'ContactController',
      access: { requiredAuthentication: true}
    })
    .state('contact/:id', {
      url: "/contact/:id",
      templateUrl: "partials/contact.view.html",
      controller: 'ContactController',
      access: { requiredAuthentication: true}
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
      templateUrl: "partials/bookmark.list.html",
      controller: 'BookmarkListController',
      access: { requiredAuthentication: true }
    })
    .state('bookmark.create', {
      url: "/bookmark/create",
      templateUrl: "partials/bookmark.view.html",
      controller: 'BookmarkController',
      access: { requiredAuthentication: true }
    })
    .state('bookmark/:id', {
      url: "/bookmark/:id",
      templateUrl: "partials/bookmark.view.html",
      controller: 'BookmarkController',
      access: { requiredAuthentication: true }
    })
    .state('sitemap', {
      url: "/sitemap",
      templateUrl: 'partials/sitemap.html',
      access: { requiredAuthentication: false }
    });
  }
]);

app.config(function ($httpProvider) {
  $httpProvider.interceptors.push('TokenInterceptor');
});

app.run(function ($rootScope,$window, $state, $location, flash, AuthenticationService) {

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

    console.log('toSstate.access.requiredAuthentication: ' + toState.access.requiredAuthentication); 
    console.log('AuthenticationService.isAuthenticated: ' + AuthenticationService.isAuthenticated); 
    console.log('StateChange -> ' + toState.name); 

    // Do we have a token in localStorage i.o. do we show sign-in or logout?.
    if($window.localStorage.getItem('token')) {
      $rootScope.isAuthenticated = true;
    }
    else {
      $rootScope.isAuthenticated = false;
    }

    // Redirect only if both isAuthenticated is false and no token is set
    if (toState.access.requiredAuthentication && !AuthenticationService.isAuthenticated) {
      flash('alert', 'Sign-in first');
      event.preventDefault();
      $state.go('home');
    }
  });

});
