appServices.provider('markdownConverter', function () {

    // Showdown.js required

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
  var auth = {isAuthenticated: true };
  return auth;
});

appServices.factory('TokenInterceptor', function ($q, $window, AuthenticationService) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      if ($window.localStorage.token) {
        config.headers.Authorization = 'Bearer ' + $window.localStorage.token;
      }
      console.log('TokenInterceptor -> request: ' + config.url); 
      return config;
    },
    requestError: function(rejection) {
      //AuthenticationService.isAuthenticated = false;
      console.log('TokenInterceptor -> requestError -> rejection: ' + rejection.status); 
      return $q.reject(rejection);
    },

    /* Set Authentication.isAuthenticated to true if 200 received */
    response: function (response) {
      if (response !== null && response.status === 200 && $window.localStorage.token) {
        //AuthenticationService.isAuthenticated = true;
      }
      console.log('TokenInterceptor -> response: ' + response.status); 
      return $q.when(response);
    },

    // Revoke client authentication if 401 is received 
    responseError: function(rejection) {
      if (rejection.status === 401) {
        delete $window.localStorage.token;
        AuthenticationService.isAuthenticated = false;
      }
      console.log('TokenInterceptor -> responseError: ' + rejection.status); 
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
          deferred.reject('Posts are not offline');
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
          deferred.reject('Post is not offline');
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

appServices.factory('flash', ['$rootScope', '$timeout', function($rootScope, $timeout) {
 
  // Thanks to: https://github.com/gtramontina/angular-flash

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

appServices.service( 'MarkdownToc', function() {

  var service = {

    make: function(data) {

      // Inspiration from Eugene Datsky
      // https://raw.githubusercontent.com/princed/table-of-contents-preprocessor/master/toc.js

      var indents = [""];
      for(var i = 1; i < 10; i++) {
          indents.push(indents[i-1] + " ");
      }

      if (data.content !== undefined) {

        var lines = data.content.trimRight().split('\n');
        var titles = [];
        var toc = [];
        var depths = [];
        var minDepth = 1000000;

        for(var i = 0; i < lines.length; i++) {
          var line = lines[i];
          var m = line.match(/^(#+)(.*)$/);
          if (!m) continue;
          minDepth = Math.min(minDepth, m[1].length);
          depths.push(m[1].length);

          title = m[2];
          uri = title.trim().toLowerCase().replace(/[\s-]/g, '').replace(/[^-0-9a-z]/g, '');

          titles.push({title: title, uri: uri}).trim;
        }

        for(var i = 0; i < depths.length; i++) {
          depths[i] -= minDepth;
        }

        for(var i = 0; i < depths.length; i++) {
          toc.push(indents[depths[i]] + "- [" + titles[i].title + "](/#/post/" + data._id + "#" + titles[i].uri + ")");
        }

        // Show TOC if we have more then 3 titles.
        if (titles.length <= 3) {
          return false;
        } else {
          return toc.join('\n');
        }
      }
    }
  }

  return service;

});

