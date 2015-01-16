// Showdown.js required
appServices.provider('markdownConverter', function () {
    var opts = { extensions: ['table'] };
    return {
      config: function (newOpts) {
        opts = newOpts;
      },
      $get: function () {
        return new Showdown.converter(opts);
      }
    };
});

appServices.factory('AuthenticationService', function() {
  var auth = {isAuthenticated: false };
  return auth;
});

appServices.factory('TokenInterceptor', function ($q, $window, AuthenticationService) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      if ($window.localStorage.token) {
        config.headers.Authorization = 'Bearer ' + $window.localStorage.token;
      }
      return config;
    },
    requestError: function(rejection) {
      return $q.reject(rejection);
      AuthenticationService.isAuthenticated = false;
      console.log('TokenInterceptor -> request error -> rejection: '+ rejection); 
    },

    /* Set Authentication.isAuthenticated to true if 200 received */
    response: function (response) {
      console.log('TokenInterceptor -> check authenticated -> response.status: '+ response.status); 
      //if (response !== null && response.status === 200 && $window.localStorage.token && !AuthenticationService.isAuthenticated) {
      if (response !== null && response.status === 200 && $window.localStorage.token) {
        AuthenticationService.isAuthenticated = true;
        console.log('TokenInterceptor -> is authenticated -> response.status: '+ response.status); 
      }
      return response || $q.when(response);
    },

    // Revoke client authentication if 401 is received 
    responseError: function(rejection) {
      if (rejection.status === 401) {
        delete $window.localStorage.token;
        AuthenticationService.isAuthenticated = false;
        console.log('TokenInterceptor -> rejection -> 401'); 
      }
      return $q.reject(rejection);
    }
  };
});

appServices.factory('CalendarService',['$http', function($http) {
  return {

    read: function(id) {
      return $http.get(options.api.base_url + '/calendar/' + id)
      .error(function(data, status, headers, config) {
      });
    },

    findAll: function(start, end) {
      return $http.get(options.api.base_url + '/calendar/', {'params': {start: start, end: end}})
      .error(function(data, status, headers, config) {
      });
    },

    searchAll: function(searchKey) { 
      return $http.get(options.api.base_url + '/calendar/search', {'params': {searchKey: searchKey}});
    },

    delete: function(id) {
      return $http.delete(options.api.base_url + '/calendar/' + id);
    },

    create: function(calendar) {
      return $http.post(options.api.base_url + '/calendar', {'calendar': calendar});
    },

    update: function(calendar) {
      return $http.put(options.api.base_url + '/calendar', {'calendar': calendar});
    },

  };
}]);

appServices.factory('PostService',['$http', function($http) {
  return {

    read: function(id) {
      return $http.get(options.api.base_url + '/post/' + id)
      .error(function(data, status, headers, config) {
      });
    },

    findAll: function(limit) {
      return $http.get(options.api.base_url + '/post/', {'params': {limit: limit}})
      .error(function(data, status, headers, config) {
      });
    },

    searchAll: function(searchKey) { 
      return $http.get(options.api.base_url + '/post/search', {'params': {searchKey: searchKey}});
    },

    changePublicState: function(id, newPublicState) {
      return $http.put(options.api.base_url + '/post', {'post': {_id: id, public: newPublicState}});
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
}]);

appServices.factory('UserService', function ($http) {
  return {
    signIn: function(username, password) {
      return $http.post(options.api.base_url + '/user/signin', {username: username, password: password});
    },
    register: function(username, password, passwordConfirmation) {
      return $http.post(options.api.base_url + '/user/register', {username: username, password: password, passwordConfirmation: passwordConfirmation });
    }
  };
});

// Thanks to: https://github.com/gtramontina/angular-flash
appServices.factory('flash', ['$rootScope', '$timeout', function($rootScope, $timeout) {

  var messages = [];
  var reset;
  var cleanup = function() {
    $timeout.cancel(reset);
    reset = $timeout(function() { messages = []; });
  };

  var emit = function() {
    $rootScope.$emit('flash:message', messages, cleanup);
  };

  $rootScope.$on('$locationChangeSuccess', emit);

  var asMessage = function(level, text) {
    if (!text) {
      text = level;
      level = '';
    }
    return { level: level, text: text };
  };

  var asArrayOfMessages = function(level, text) {
    if (level instanceof Array) return level.map(function(message) {
      return message.text ? message : asMessage(message);
    });
    return text ? [{ level: level, text: text }] : [asMessage(level)];
  };

  var flash = function(level, text) {
    emit(messages = asArrayOfMessages(level, text));
  };

  ['error', 'warning', 'info', 'success'].forEach(function (level) {
    flash[level] = function (text) { flash(level, text); };
  });

  return flash;
}]);

