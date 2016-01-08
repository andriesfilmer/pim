appServices.factory('AuthenticationService', ['ENV', function(ENV) {

  // AuthenticationService is probably not a good place for ENV.
  // But I leave it for now......
  if ( ENV === 'development' ) {
    options.api.base_url = "http://dev.filmer.net:3001";
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

appServices.factory('UserService', function ($q, $window, $http) {
  return {
    signIn: function(email, password) {
      return $http.post(options.api.base_url + '/user/signin', {email: email, password: password});
    },
    register: function(fullname, email, password, passwordConfirmation) {
      return $http.post(options.api.base_url + '/user/register', 
        {fullname: fullname, email: email, password: password, passwordConfirmation: passwordConfirmation });
    },
    changePassword: function(password, passwordConfirmation) {
      var deferred = $q.defer();
      $http.post(options.api.base_url + '/user/password-change', {password: password, passwordConfirmation: passwordConfirmation})
      .then(function(response) {
          $window.localStorage.token = response.data.token;
          deferred.resolve(response);
      }, function(response) {
          deferred.reject(response);
      });
      return deferred.promise;
    },
    sendToken: function(email) {
      return $http.post(options.api.base_url + '/user/send-token', 
        {email: email});
    }
  };
});

appServices.factory('CalendarService', function($http, $q, $timeout, $window) {

  return {

    find: function(start, end, saveLocal) {

      // Do we want this action to be stored in localStorage?
      if (typeof saveLocal === 'undefined') { saveLocal = true; }

      // Var to store events in LocalStorage with year+day io 'yyyy-dd'.
      // Save by the month view of the calender view io. this can span 3 months.
      if (moment(start).format('MM') === moment(start).add(10,'Days').format('MM')) {
        thisMonth = moment(start).format('YYYY-MM');
      }
      else {
        thisMonth = moment(start).add(1,'M').format('YYYY-MM');
      }

      var deferred = $q.defer();

      $http.get(options.api.base_url + '/calendar/', {'params': {start: start, end: end}})
      .then(function(response) {
        // Store events in LocalStorage with year+day io 'yyyy-dd'.
        if (saveLocal) {
          $window.localStorage['events_' + thisMonth] = JSON.stringify(response.data);
        }
        deferred.resolve(response);
      }, function(response) {
        console.log(response.data); 
        if($window.localStorage['events_' + thisMonth]) {
          response.statusText = 'Offline: Events from localstorage';
          response.data = JSON.parse($window.localStorage['events_' + thisMonth]);
        } else {
          response.statusText = 'Offline: Events not in localstorage';
          response.data = {};
        }
        deferred.reject(response);
      });

      // Notify on slow connections
      var msg = [{"title": "Loading..."}];
      $timeout(function() {
        deferred.notify(msg);
      }, 1000);

      return deferred.promise;
    },

    read: function(id) {
      var deferred = $q.defer();
      $http.get(options.api.base_url + '/calendar/' + id).then(function(response) {

        $window.localStorage['event_' + id] = JSON.stringify(response.data);
        deferred.resolve(response);

     }, function(response) {
        if($window.localStorage['event_' +id]) {
          response.statusText = 'Offline: Event from localstorage';
          response.data = JSON.parse($window.localStorage['event_' + id]);
        } else {
          response.statusText = 'Offline: Event not in localstorage';
          response.data = {};
        }
        deferred.reject(response);
      });

      // Notify on slow connections
      var msg = {"title": "Loading..."};
      $timeout(function() {
        deferred.notify(msg);
      }, 1000);

      return deferred.promise;
    },

    search: function(searchKey) {
      var deferred = $q.defer();
      $http.get(options.api.base_url + '/calendar/search', {'params': {searchKey: searchKey}})
      .then(function(response) {
        deferred.resolve(response);
      }, function(response) {
        response.statusText = 'Error: can\'t search events';
        deferred.reject(response);
      });

      // Notify on slow connections
      var msg = [{"title": "Loading..."}];
      $timeout(function() {
        deferred.notify(msg);
      }, 1000);

      return deferred.promise;
    },

    create: function(calendar) {
      return $http.post(options.api.base_url + '/calendar', {'calendar': calendar});
    },

    update: function(calendar) {
      return $http.put(options.api.base_url + '/calendar', {'calendar': calendar});
    },

    delete: function(id) {
      return $http.delete(options.api.base_url + '/calendar/' + id);
    },

  };
});

appServices.factory('ContactService', function($http, $q, $timeout, $window) {

  return {

    findAll: function(starred, birthdate, order, limit, saveLocal) {

      // Do we want this action to be stored in localStorage?
      if (typeof saveLocal === 'undefined') { saveLocal = true; }

      var deferred = $q.defer();

      $http.get(options.api.base_url + '/contact/', {'params': {starred: starred, birthdate: birthdate, order: order, limit: limit}})
      .then(function(response) {
        if (saveLocal) {
          $window.localStorage.contactsAll = JSON.stringify(response.data);
        }
        deferred.resolve(response);
      }, function(response) {
        console.log(response.data); 
        if($window.localStorage.contactsAll) {
          response.data = JSON.parse($window.localStorage.contactsAll);
          response.statusText = "Offline: Contacts from localstorage";
        } else {
          response.statusText = "Offline: Contacts not in localstorage";
        }
        deferred.reject(response);
      });

      // Notify on slow connections
      var msg = [{"name": "Loading..."}];
      $timeout(function() {
        deferred.notify(msg);
      }, 1000);

      return deferred.promise;

    },

    read: function(id) {
      var deferred = $q.defer();
      $http.get(options.api.base_url + '/contact/' + id).then(function(response) {
        deferred.resolve(response);
        $window.localStorage['contact_' + id] = JSON.stringify(response.data);
      }, function(response) {
        console.log(response.data); 
        if($window.localStorage.getItem('contact_' + id)) {
          response.data = JSON.parse($window.localStorage.getItem('contact_' + id));
          response.statusText = 'Offline: Contact from localstorage';
        }
        else {
          response.statusText = 'Offline: Contact not in localstorage';
          response.data = {};
        }
        deferred.reject(response);
      });

      // Notify on slow connections
      var msg = {"name": "Loading..."};
      $timeout(function() {
        deferred.notify(msg);
      }, 1000);

      return deferred.promise;

    },

    searchAll: function(birthdate, searchKey) { 
      params = {'params': {birthdate: birthdate, searchKey: searchKey}};
      return $http.get(options.api.base_url + '/contact/search', params);
    },

    create: function(contact) {
      return $http.post(options.api.base_url + '/contact', {'contact': contact});
    },

    update: function(contact) {
      return $http.put(options.api.base_url + '/contact', {'contact': contact});
    },

    changeStarredState: function(id, newStarredState) {
      return $http.put(options.api.base_url + '/contact', {'contact': {_id: id, starred: newStarredState}});
    },

    delete: function(id) {
      return $http.delete(options.api.base_url + '/contact/' + id);
    },

    vCards: function(phones, companies, emails, websites, photo, addresses, birthdate, notes) {
      return $http.post(options.api.base_url + '/contact/download/vcards', {'params': {phones: phones, companies: companies, 
        emails: emails, websites: websites, addresses: addresses, birthdate: birthdate, photo: photo, notes: notes}});
    },

    vCard: function(contact_id, phones, companies, emails, websites, photo, addresses, birthdate, notes) {
      return $http.post(options.api.base_url + '/contact/download/vcard', {'params': {contact_id: contact_id, 
        phones: phones, companies: companies, emails: emails, websites: websites, addresses: addresses, 
        birthdate: birthdate, photo: photo, notes: notes}}, {responseType: 'arraybuffer'});
    },

    upload: function(contact_id, dataUrl) {
      var deferred = $q.defer();
      $http.post(options.api.base_url + '/fileupload', {'params': {contact_id: contact_id, dataUrl: dataUrl}})
      .then(function(response) {

        // Notify on slow connections
        data = "/static/images/profile.jpg";
        deferred.notify(data);

        deferred.resolve(response);

      }, function (response) {
        deferred.reject(response); 
      });
      return deferred.promise;
    }
  };
});

appServices.factory('PostService', function($http, $q, $timeout, $window) {

  return {

    findAll: function(limit) {
      var deferred = $q.defer();
      $http.get(options.api.base_url + '/post/', {'params': {limit: limit}})
      .then(function(response) {
        $window.localStorage.postsAll = JSON.stringify(response.data);
        deferred.resolve(response);
     }, function(response) {
        console.log(response.statusText); 
        if($window.localStorage.postsAll) {
          response.statusText = 'Offline: Posts from localstorage';
          response.data = JSON.parse($window.localStorage.postsAll);
        } else {
          response.statusText = 'Offline: Posts not in localstorage';
          deferred.reject(response);
        }
        deferred.reject(response);
      });

      // Notify on slow connections
      var msg = [{"title": "Loading..."}];
      $timeout(function() {
        deferred.notify(msg);
      }, 1000);

      return deferred.promise;
    },

    read: function(id) {
      var deferred = $q.defer();
      $http.get(options.api.base_url + '/post/' + id).then(function(response) {
        $window.localStorage['post_' + id] = JSON.stringify(response.data);
        deferred.resolve(response);
      }, function(response) {
        console.log(response.statusText); 
        if($window.localStorage['post_' + id]) {
          response.statusText = 'Offline: Post from localstorage';
          response.data = JSON.parse($window.localStorage['post_' + id]);
          deferred.reject(response);
        } else {
          response.statusText = 'Offline: Post not in localstorage';
          deferred.reject(response);
        }
      });

      // Notify on slow connections
      var msg = {"title": "Loading..."};
      $timeout(function() {
        deferred.notify(msg);
      }, 1000);

      return deferred.promise;
    },

    readVersion: function(id) {
      return $http.get(options.api.base_url + '/post/version/' + id);
    },

    listVersions: function(id) {
      return $http.get(options.api.base_url + '/post/versions/' + id);
    },

    create: function(post) {
      return $http.post(options.api.base_url + '/post', {'post': post});
    },

    update: function(post) {
      return $http.put(options.api.base_url + '/post', {'post': post});
    },

    searchAll: function(searchKey) { 
      return $http.get(options.api.base_url + '/post/search', {'params': {searchKey: searchKey}});
    },

    pdf: function(id, toc) {
      return $http.post(options.api.base_url + '/post/pdf/' + id, {}, {responseType: 'arraybuffer'});
    },

    delete: function(id) {
      return $http.delete(options.api.base_url + '/post/' + id);
    },

  };
});

appServices.factory('BookmarkService', function($http, $q, $timeout, $window) {

  return {

    findAll: function(limit) {

      var deferred = $q.defer();

      $http.get(options.api.base_url + '/bookmark/', {'params': {limit: limit}})
      .then(function(response) {
        console.log('Fetched bookmarks from MongoDb and saved to localStorage.'); 
        $window.localStorage.bookmarksAll = JSON.stringify(response.data);
        deferred.resolve(response);
      }, function(response) {
        console.log(response.data); 
        if($window.localStorage.bookmarksAll) {
          response.data = JSON.parse($window.localStorage.bookmarksAll);
          response.statusText = "Offline: Bookmarks in localstorage";
        } else {
          response.statusText = "Offline: Bookmarks not in localstorage";
        }
        deferred.reject(response);
      });

      // Notify on slow connections
      var msg = [{"title": "Loading..."}];
      $timeout(function() {
        deferred.notify(msg);
      }, 1000);

      return deferred.promise;
    },

    read: function(id) {
      var deferred = $q.defer();
      $http.get(options.api.base_url + '/bookmark/' + id).then(function(response) {
        $window.localStorage['bookmark_' + id] = JSON.stringify(response.data);
        deferred.resolve(response);
      }, function(response) {
        console.log(response.data); 
        if($window.localStorage['bookmark_' + id]) {
          response.statusText = 'Offline: Bookmark from localstorage';
          response.data = JSON.parse($window.localStorage['bookmark_' + id]);
        } else {
          response.statusText = 'Offline: Bookmark is not localstorage';
        }
        deferred.reject(response);
      });
      return deferred.promise;
    },

    create: function(bookmark) {
      var deferred = $q.defer();
      $http.post(options.api.base_url + '/bookmark', {'bookmark': bookmark})
      .then(function(response) {
        deferred.resolve(response);
      }, function(response) {
        console.log(response.data); 
        deferred.reject(response);
      });
      return deferred.promise;
    },

    update: function(bookmark) {
      var deferred = $q.defer();
      $http.put(options.api.base_url + '/bookmark', {'bookmark': bookmark})
      .then(function(response) {
        $window.localStorage['bookmark_' + bookmark.id] = JSON.stringify(response.data);
        deferred.resolve(response);
      }, function(response) {
        console.log(response.data); 
        deferred.reject(response);
      });
      return deferred.promise;
    },

    searchAll: function(searchKey) { 
      return $http.get(options.api.base_url + '/bookmark/search', {'params': {searchKey: searchKey}});
    },

    delete: function(id) {
      return $http.delete(options.api.base_url + '/bookmark/' + id);
    },

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

    var opts = { extensions: ['table', 'targetblank'] };
    return {
      config: function (newOpts) {
        opts = newOpts;
      },
      $get: function () {
        return new showdown.Converter(opts);
      }
    };
});

appServices.service('MarkdownToc', function() {

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

appServices.factory('Utils', function($q) {

  return {

    isImage: function(src) {
      var deferred = $q.defer();
      var image = new Image();
      image.onerror = function() {
          deferred.resolve(false);
      };
      image.onload = function() {
          deferred.resolve(true);
      };
      image.src = src;
      return deferred.promise;
    }

  };

});
