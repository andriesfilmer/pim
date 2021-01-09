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
      params: {user_id: '', token: '' },
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
      params: { start: moment(new Date()).format('YYYY-MM-DD')},
      url: "/event/new/:start",
      templateUrl: "partials/calendar.event.html",
      controller: "EventController",
      access: { requiredAuthentication: true }
    })
    .state('calendar.version', {
      url: "/version/:id",
      templateUrl: "partials/calendar.event.html",
      controller: 'EventController',
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
      controller: 'ContactController'
    })
    .state('contact.import-export', {
      url: "/import-export",
      templateUrl: "partials/contact.import-export.html",
      controller: 'ContactListController'
    })
    .state('contact.view', {
      url: "/:id",
      templateUrl: "partials/contact.view.html",
      controller: 'ContactController'
    })
    .state('contact.version', {
      url: "/version/:id",
      templateUrl: "partials/contact.view.html",
      controller: 'ContactController'
    })

    // Post views
    .state('post', {
      url: "/post",
      templateUrl: "partials/post.html"
    })
    .state('post.list', {
      url: "/list",
      templateUrl: "partials/post.list.html",
      controller: 'PostListController'
    })
    .state('post.create', {
      url: "/create",
      templateUrl: "partials/post.view.html",
      controller: 'PostController'
    })
    .state('post.view', {
      url: "/:id",
      templateUrl: "partials/post.view.html",
      controller: 'PostController'
    })
    .state('post.version', {
      url: "/version/:id",
      templateUrl: "partials/post.view.html",
      controller: 'PostController'
    })

    // Bookmark views
    .state('bookmark', {
      url: "/bookmark",
      templateUrl: "partials/bookmark.html"
    })
    .state('bookmark.list', {
      url: "/bookmark",
      templateUrl: "partials/bookmark.list.html",
      controller: 'BookmarkListController'
    })
    .state('bookmark.create', {
      url: "/bookmark/create",
      templateUrl: "partials/bookmark.view.html",
      controller: 'BookmarkController'
    })
    .state('bookmark.view', {
      url: "/:id",
      templateUrl: "partials/bookmark.view.html",
      controller: 'BookmarkController'
    })
    // Startpage
    .state('about', {
      url: "/",
      templateUrl: 'partials/about.html'
    })
    // Startpage
    .state('reload', {
      url: "/reload",
      templateUrl: 'partials/reload.html'
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

app.run(function ($rootScope, $window, $transitions, flash) {

  $transitions.onStart({ to: '**' }, function(trans) {

    //console.log("######## trans.to().name: " + trans.to().name);
    //console.dir(trans.to());

    var auth = trans.injector().get('AuthenticationService');

    if (auth.isAuthenticated) {
      $rootScope.signedIn = true;
      $rootScope.fullname = $window.localStorage.fullname;

      if (trans.to().name === 'signin') {
        flash('waring', 'You are already logged in');
      }
    }
    else {
      $rootScope.signedIn = false;
    }

  });

  $(document).foundation();

  // Add font-size from general settings.
  $("body").addClass($window.localStorage.fontSetting);

});
