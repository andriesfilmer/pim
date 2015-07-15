appServices.factory('AuthenticationService', ['ENV', function(ENV) {

  // AuthenticationService is maybe not a good place for ENV.
  // But I leave it for now......
  if ( ENV === 'development' ) {
    options.api.base_url = "http://test.filmer.net:3001";
    console.log('ENV in Development'); 
  }
  else {
    options.api.base_url = "https://api.filmer.net";
    console.log('ENV in Production'); 
  }

  var auth = {isAuthenticated: false };
  return auth;

}]);

appServices.factory('TokenInterceptor', function ($q, $window, AuthenticationService) {
  return {
    request: function (config) {
      console.log('TokenInterceptor -> request -> url: ' + config.url); 
      config.headers = config.headers || {};
      if ($window.localStorage.token) {
        config.headers.Authorization = 'Bearer ' + $window.localStorage.token;
      }
      return config;
    },
    requestError: function(rejection) {
      console.log('TokenInterceptor -> requestError -> rejection.status: ' + rejection.status); 
      return $q.reject(rejection);
    },

    /* Set Authentication.isAuthenticated to true if 200 received */
    response: function (response) {
      console.log('TokenInterceptor -> response -> response.status: ' + response.status); 
      if (response !== null && response.status === 200 && $window.localStorage.token) {
        AuthenticationService.isAuthenticated = true;
      }
      return $q.when(response);
    },

    // Revoke client authentication if 401 is received 
    responseError: function(rejection) {
      console.log('TokenInterceptor -> responseError -> reject.status: ' + rejection.status); 
      if (rejection.status === 401) {
        delete $window.localStorage.token;
        AuthenticationService.isAuthenticated = false;
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

appServices.factory('ContactService', function($http, $q, $window) {

  return {

    findAll: function(starred, order, limit) {
      var deferred = $q.defer();
      $http.get(options.api.base_url + '/contact/', {'params': {starred: starred, order: order, limit: limit}})
      .success(function(data) {
        $window.localStorage.contactsAll = JSON.stringify(data);
        console.log('Fetched contacts from MongoDb and saved to localStorage.'); 
        deferred.resolve(data);
      })
      .error(function(data, status, headers, config) {
        console.log('Error connecting MongoDb, load localStorage if exists.'); 
        if($window.localStorage.getItem('contactsAll') === null) {
          deferred.reject('Contacts are not offline');
        }
        else {
          localData = JSON.parse($window.localStorage.contactsAll);
          deferred.notify(localData);
        }
      });
      return deferred.promise;
    },

    read: function(id) {
      var deferred = $q.defer();
      $http.get(options.api.base_url + '/contact/' + id)
      .success(function(data) {
        $window.localStorage['contact_' + id] = JSON.stringify(data);
        console.log('Fetched contact from MongoDb and saved to localStorage.'); 
        deferred.resolve(data);
      })
      .error(function(data, status, headers, config) {
        console.log('Error connecting MongoDb, load localStorage if exists.'); 
        if($window.localStorage.getItem('contact_' + id) === null) {
          deferred.reject('Contact is not offline');
        }
        else {
          localData = JSON.parse($window.localStorage['contact_' + id]);
          deferred.notify(localData);
        }
      });
      return deferred.promise;
    },

    create: function(contact) {
      var deferred = $q.defer();
      $http.post(options.api.base_url + '/contact', {'contact': contact})
      .success(function() {
        console.log('Created contact in MongoDb'); 
        deferred.resolve('Created contact successfull');
      })
      .error(function(data, status, headers, config) {
        console.log('Error connecting MongoDb.'); 
        deferred.reject('Error creating contact');
      });
      return deferred.promise;
    },

    update: function(contact) {
      var deferred = $q.defer();
      $http.put(options.api.base_url + '/contact', {'contact': contact})
      .success(function(data) {
        $window.localStorage['contact_' + contact.id] = JSON.stringify(data);
        console.log('Updated contact in localStorage and MongoDb'); 
        deferred.resolve('Updated contact successfull');
      })
      .error(function(data, status, headers, config) {
        console.log('Error connecting MongoDb.'); 
        deferred.reject('Error updating contact');
      });
      return deferred.promise;
    },

    searchAll: function(searchKey) { 
      return $http.get(options.api.base_url + '/contact/search', {'params': {searchKey: searchKey}});
    },

    changeStarredState: function(id, newStarredState) {
      return $http.put(options.api.base_url + '/contact', {'contact': {_id: id, starred: newStarredState}});
    },

    delete: function(id) {
      return $http.delete(options.api.base_url + '/contact/' + id);
    },

    downloadContacts: function(phones, companies, emails, websites, photo, addresses, birthdate, notes) {
      return $http.get(options.api.base_url + '/contact/download', {'params': {phones: phones, companies: companies,
        emails: emails, websites: websites, addresses: addresses, birthdate: birthdate, photo: photo, notes: notes}});
    }

  };
});

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

    readVersion: function(id) {
      var deferred = $q.defer();
      $http.get(options.api.base_url + '/post/version/' + id)
      .success(function(data) {
        console.log('Fetched post version from MongoDb'); 
        deferred.resolve(data);
      })
      .error(function(data, status, headers, config) {
        console.log('Error connecting MongoDb for version'); 
      });
      return deferred.promise;
    },

    listVersions: function(id) {
      var deferred = $q.defer();
      $http.get(options.api.base_url + '/post/versions/' + id)
      .success(function(data) {
        console.log('Fetched post versions from MongoDb.'); 
        deferred.resolve(data);
      })
      .error(function(data, status, headers, config) {
        console.log('Error connecting MongoDb for versions'); 
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

appServices.factory('BookmarkService', function($http, $q, $window) {

  return {

    findAll: function(limit) {
      var deferred = $q.defer();
      $http.get(options.api.base_url + '/bookmark/', {'params': {limit: limit}})
      .success(function(data) {
        $window.localStorage.bookmarksAll = JSON.stringify(data);
        console.log('Fetched bookmarks from MongoDb and saved to localStorage.'); 
        deferred.resolve(data);
      })
      .error(function(data, status, headers, config) {
        console.log('Error connecting MongoDb, load localStorage if exists.'); 
        if($window.localStorage.getItem('bookmarksAll') === null) {
          deferred.reject('Bookmarks are not offline');
        }
        else {
          localData = JSON.parse($window.localStorage.bookmarksAll);
          deferred.notify(localData);
        }
      });
      return deferred.promise;
    },

    read: function(id) {
      var deferred = $q.defer();
      $http.get(options.api.base_url + '/bookmark/' + id)
      .success(function(data) {
        $window.localStorage['bookmark_' + id] = JSON.stringify(data);
        console.log('Fetched bookmark from MongoDb and saved to localStorage.'); 
        deferred.resolve(data);
      })
      .error(function(data, status, headers, config) {
        console.log('Error connecting MongoDb, load localStorage if exists.'); 
        if($window.localStorage.getItem('bookmark_' + id) === null) {
          deferred.reject('Bookmark is not offline');
        }
        else {
          localData = JSON.parse($window.localStorage['bookmark_' + id]);
          deferred.notify(localData);
        }
      });
      return deferred.promise;
    },

    create: function(bookmark) {
      var deferred = $q.defer();
      $http.post(options.api.base_url + '/bookmark', {'bookmark': bookmark})
      .success(function() {
        console.log('Created bookmark in MongoDb'); 
        deferred.resolve('Created bookmark successfull');
      })
      .error(function(data, status, headers, config) {
        console.log('Error connecting MongoDb.'); 
        deferred.reject('Error creating bookmark');
      });
      return deferred.promise;
    },

    update: function(bookmark) {
      var deferred = $q.defer();
      $http.put(options.api.base_url + '/bookmark', {'bookmark': bookmark})
      .success(function(data) {
        $window.localStorage['bookmark_' + bookmark.id] = JSON.stringify(data);
        console.log('Updated bookmark in localStorage and MongoDb'); 
        deferred.resolve('Updated bookmark successfull');
      })
      .error(function(data, status, headers, config) {
        console.log('Error connecting MongoDb.'); 
        deferred.reject('Error updating bookmark');
      });
      return deferred.promise;
    },

    searchAll: function(searchKey) { 
      return $http.get(options.api.base_url + '/bookmark/search', {'params': {searchKey: searchKey}});
    },

    changePublicState: function(id, newPublicState) {
      return $http.put(options.api.base_url + '/bookmark', {'bookmark': {_id: id, public: newPublicState}});
    },

    delete: function(id) {
      return $http.delete(options.api.base_url + '/bookmark/' + id);
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
    },
    changePassword: function(password, passwordConfirmation) {
      return $http.post(options.api.base_url + '/user/password-change', 
        {password: password, passwordConfirmation: passwordConfirmation});
    },
    sendToken: function(email) {
      return $http.post(options.api.base_url + '/user/send-token', 
        {email: email});
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

        for(var j = 0; j < lines.length; j++) {
          var line = lines[j];
          var m = line.match(/^(#+)(.*)$/);
          if (!m) continue;
          minDepth = Math.min(minDepth, m[1].length);
          depths.push(m[1].length);

          title = m[2];
          uri = title.trim().toLowerCase().replace(/[\s-]/g, '').replace(/[^-0-9a-z]/g, '');

          titles.push({title: title, uri: uri});
        }

        for(var k = 0; k < depths.length; k++) {
          depths[k] -= minDepth;
        }

        for(var l = 0; l < depths.length; l++) {
          toc.push(indents[depths[l]] + "- [" + titles[l].title + "](/#/post/" + data._id + "#" + titles[l].uri + ")");
        }

        // Show TOC if we have more then 3 titles.
        if (titles.length <= 3) {
          return false;
        } else {
          return toc.join('\n');
        }
      }
    }
  };

  return service;

});

appServices.service('FileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl, filename){
        var fd = new FormData();
        fd.append('file', file);
        $http.post(options.api.base_url + uploadUrl + '?filename=' + filename , fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(){
        })
        .error(function(){
        });
    };
}]);
