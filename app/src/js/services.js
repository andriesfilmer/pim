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

    find: function(start, end) {
      return $http.get(options.api.base_url + '/calendar/', {'params': {start: start, end: end}})
      .error(function(data, status, headers, config) {
      });
    },

    search: function(searchKey) { 
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

appServices.factory('PostService', function($http, $q, $window) {

  return {

    findAll: function(limit) {
      var deferred = $q.defer();
      $http.get(options.api.base_url + '/post/', {'params': {limit: limit}})
      .success(function(data) {
        $window.localStorage.postsAll = JSON.stringify(data);
        console.log('Fetched posts from MongoDb and saved to localStorage.'); 
        deferred.resolve(data);
      })
      .error(function(data, status, headers, config) {
        console.log('Error connecting MongoDb, load localStorage if exists.'); 
        if($window.localStorage.getItem('postsAll') === null) {
          deferred.reject('Offline: Posts not in local storage');
        }
        else {
          localData = JSON.parse($window.localStorage.postsAll);
          deferred.notify(localData);
        }
      });
      return deferred.promise;
    },

    read: function(id) {
      var deferred = $q.defer();
      $http.get(options.api.base_url + '/post/' + id)
      .success(function(data) {
        $window.localStorage['post_' + id] = JSON.stringify(data);
        console.log('Fetched post from MongoDb and saved to localStorage.'); 
        deferred.resolve(data);
      })
      .error(function(data, status, headers, config) {
        console.log('Error connecting MongoDb, load localStorage if exists.'); 
        if($window.localStorage.getItem('post_' + id) === null) {
          deferred.reject('Offline: Post not in localStorage');
        }
        else {
          localData = JSON.parse($window.localStorage['post_' + id]);
          deferred.notify(localData);
        }
      });
      return deferred.promise;
    },

    create: function(post) {
      var deferred = $q.defer();
      $http.post(options.api.base_url + '/post', {'post': post})
      .success(function() {
        console.log('Created post in MongoDb'); 
        deferred.resolve('Created post successfull');
      })
      .error(function(data, status, headers, config) {
        console.log('Error connecting MongoDb.'); 
        deferred.reject('Error creating post');
      });
      return deferred.promise;
    },

    update: function(post) {
      var deferred = $q.defer();
      $http.put(options.api.base_url + '/post', {'post': post})
      .success(function(data) {
        $window.localStorage['post_' + post.id] = JSON.stringify(data);
        console.log('Updated post in localStorage and MongoDb'); 
        deferred.resolve('Updated post successfull');
      })
      .error(function(data, status, headers, config) {
        console.log('Error connecting MongoDb.'); 
        deferred.reject('Error updating post');
      });
      return deferred.promise;
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

  };
});

appServices.factory('UserService', function ($http) {
  return {
    signIn: function(email, password) {
      return $http.post(options.api.base_url + '/user/signin', {email: email, password: password});
    },
    register: function(fullname, email, password, passwordConfirmation) {
      return $http.post(options.api.base_url + '/user/register', 
         {fullname: fullname, email: email, password: password, passwordConfirmation: passwordConfirmation });
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

