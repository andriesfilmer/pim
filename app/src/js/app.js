var appServices = angular.module('appServices', []);
var appFilters = angular.module('appFilters', []);
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
                                 'appFilters',
                                 'appDirectives',
                                 'ngCropper'
]);

var options = {};
options.api = {};

app.config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

  // For any unmatched url, redirect to /calendar/month
  $urlRouterProvider.otherwise("/");
  //
  // Now set up the states
  $stateProvider
    .state('home', {
      url: "/home?start",
      templateUrl: "partials/home.html",
      controller: "HomeController",
      access: { requiredAuthentication: true }
     })
    // Users views
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
    .state('user.settings', {
      url: '/settings',
      templateUrl: 'partials/user.settings.html',
      controller: 'UserController',
      access: { requiredAuthentication: true}
    })
    .state('user.change-password', {
      url: '/change-password/:token/:user_id',
      templateUrl: 'partials/user.change-password.html',
      controller: 'UserController',
      access: { requiredAuthentication: false}
    })
    .state('user.reset-password', {
      url: "/reset-password",
      templateUrl: 'partials/user.reset-password.html',
      controller: 'UserController',
      access: { requiredAuthentication: false }
    })
    // Calendar views
    .state('calendar', {
       url: "/calendar",
       templateUrl: "partials/calendar.html",
       access: { requiredAuthentication: false }
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
      access: { requiredAuthentication: true }
    })
    .state('calendar.event', {
      url: "/event/:id",
      templateUrl: "partials/calendar.event.html",
      controller: "EventController",
      access: { requiredAuthentication: true }
    })
    .state('calendar.new', {
      url: "/event/new/:start",
      templateUrl: "partials/calendar.event.html",
      controller: "EventController",
      access: { requiredAuthentication: true }
    })
    .state('calendar.import-export', {
      url: "/import-export",
      templateUrl: "partials/calendar.import-export.html",
      controller: 'CalendarController',
      access: { requiredAuthentication: true}
    })

    // Contact views
    .state('contact', {
      url: "/contact",
      templateUrl: "partials/contact.html",
      access: { requiredAuthentication: true}
    })
    .state('contact.list', {
      url: "/list",
      templateUrl: "partials/contact.list.html",
      controller: 'ContactListController',
      access: { requiredAuthentication: true}
    })
    .state('contact.birthdate', {
      url: "/birthdate/:birthdate",
      templateUrl: "partials/contact.birthdate.html",
      controller: 'ContactListController',
      access: { requiredAuthentication: true}
    })
    .state('contact.starred', {
      url: "/starred/:starred",
      templateUrl: "partials/contact.starred.html",
      controller: 'ContactListController',
      access: { requiredAuthentication: true}
    })
    .state('contact.create', {
      url: "/create",
      templateUrl: "partials/contact.view.html",
      controller: 'ContactController',
      access: { requiredAuthentication: true}
    })
    .state('contact.import-export', {
      url: "/import-export",
      templateUrl: "partials/contact.import-export.html",
      controller: 'ContactListController',
      access: { requiredAuthentication: true}
    })
    .state('contact.view', {
      url: "/:id",
      templateUrl: "partials/contact.view.html",
      controller: 'ContactController',
      access: { requiredAuthentication: true }
    })

    // Post views
    .state('post', {
      url: "/post",
      templateUrl: "partials/post.html",
      controller: 'PostListController',
      access: { requiredAuthentication: true }
    })
    .state('post.list', {
      url: "/list",
      templateUrl: "partials/post.list.html",
      controller: 'PostListController',
      access: { requiredAuthentication: true }
    })
    .state('post.create', {
      url: "/create",
      templateUrl: "partials/post.view.html",
      controller: 'PostController',
      access: { requiredAuthentication: true }
    })
    .state('post.view', {
      url: "/:id",
      templateUrl: "partials/post.view.html",
      controller: 'PostController',
      access: { requiredAuthentication: true }
    })
    .state('post.version', {
      url: "/version/:id",
      templateUrl: "partials/post.view.html",
      controller: 'PostController',
      access: { requiredAuthentication: true }
    })

    // Bookmark views
    .state('bookmark', {
      url: "/bookmark",
      templateUrl: "partials/bookmark.html",
      controller: 'BookmarkListController',
      access: { requiredAuthentication: true }
    })
    .state('bookmark.list', {
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
    .state('bookmark.view', {
      url: "/:id",
      templateUrl: "partials/bookmark.view.html",
      controller: 'BookmarkController',
      access: { requiredAuthentication: true }
    })
    // Startpage
    .state('about', {
      url: "/",
      templateUrl: 'partials/about.html',
      access: { requiredAuthentication: false }
    })
    // Startpage
    .state('reload', {
      url: "/reload",
      templateUrl: 'partials/reload.html',
      access: { requiredAuthentication: false }
    });
  }
]);

app.config( [
  '$compileProvider',
  function( $compileProvider )
  {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|whatsapp|tg|mailto|sms|tel):/);
  }
]);

app.config(function ($httpProvider) {
  $httpProvider.interceptors.push('TokenInterceptor');
});

app.run(function ($rootScope, $window, $state, $timeout, $location, flash, AuthenticationService) {

  // http://stackoverflow.com/questions/16753003/angularjs-initialize-zurb-foundation-js
  $rootScope.$on('$viewContentLoaded', function () {
    $timeout(function(){
      $(document).foundation();
    }, 500);
  });


  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

    console.log('toSstate.access.requiredAuthentication: ' + toState.access.requiredAuthentication); 
    console.log('AuthenticationService.isAuthenticated: ' + AuthenticationService.isAuthenticated); 
    console.log('StateChange -> ' + toState.name); 

    // Add font-size from general settings.
    $("body").addClass($window.localStorage.fontSetting);

    // RootScope.signedIn is only for show/hide elements.
    if($window.localStorage.token) {
      $rootScope.signedIn = true;
      $rootScope.fullname = $window.localStorage.fullname;
    }
    else {
      $rootScope.signedIn = false;
    }


    if ($window.localStorage.token && (toState.name === 'signup' || toState.name === 'signin')) {
      flash('waring', 'You are already logged in');
      event.preventDefault();
      $state.go('home');
    }

    // Redirect only if both required authentication in rout  and isAuthenticated is false.
    if (toState.access.requiredAuthentication && !AuthenticationService.isAuthenticated) {

      // Do we have a token in localStorage i.o. do we show sign-in or logout?.
      // On reload/refresh don't show flash if the user has a access token.
      if(!$window.localStorage.getItem('token')) {
        flash('alert', 'Sign-in first');
      }
      event.preventDefault();
      $state.go('reload');
    }
  });

});
