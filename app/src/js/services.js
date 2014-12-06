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
    },

    /* Set Authentication.isAuthenticated to true if 200 received */
    response: function (response) {
      console.log('TokenInterceptor check authenticated'); 
      if (response !== null && response.status === 200 && $window.localStorage.token && !AuthenticationService.isAuthenticated) {
        AuthenticationService.isAuthenticated = true;
        console.log('TokenInterceptor is authenticated'); 
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

appServices.factory('PostService',['$http', function($http) {
  return {

    read: function(id) {
      return $http.get(options.api.base_url + '/post/' + id);
    },

    findAll: function(searchKey) {
      return $http.get(options.api.base_url + '/post/', {'post': { searchKey: searchKey } })
      .error(function(data, status, headers, config) {
      });
    },

    searchAll: function(searchKey) { 
      return $http.post(options.api.base_url + '/post/search', {'post': {searchKey: searchKey}});
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


