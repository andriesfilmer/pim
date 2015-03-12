appControllers.controller('PostListController', ['$scope', '$state', '$window', 'flash', 'PostService', 
  function PostListController($scope, $state, $window, flash, PostService) {

    $(document).foundation();

    // Save general post settings
    $scope.saveSettings = function saveSettings() {
      $('a.close-reveal-modal').trigger('click');
      flash('success', 'Settings saved');
      $state.go('post', {}, {reload: true});
    };

    // Set post limit for all posts
    $scope.postLimit =  $window.localStorage.postLimit;
    $scope.changeLimit = function(limit) {
      $window.localStorage.postLimit =  limit;
    };

    // Hide searchForm, toggle first. Save search.
    $scope.toggleSearch = function () {
      $scope.searchForm = !$scope.searchForm;
      $scope.searchKey =  $window.sessionStorage.postSearchKey;
    };

    // Remove search.
    $scope.resetSearch = function resetSearch() {
      delete $window.sessionStorage.postSearchKey;
      angular.element("#search-input").focus();
    };

    $scope.posts = [];

    // Init posts with promises and show all posts.
    $scope.init = PostService.findAll($window.localStorage.postLimit).then(function(data) {
      // Promise resolved
      $scope.posts = data;
    }, function(msg) {
      // Promise reject
      $scope.offline = true;
      flash('alert', msg);
    }, function(localData) {
      // Promise notify
      $scope.posts = localData;
      $scope.offline = true;
      flash('warning', 'Offline: Posts from local storage');
    });

    // Get new posts if we change the SearchKey
    $scope.$watch('searchKey', function(searchKey) {
        if (searchKey !== undefined && searchKey.length >= 3) {
          $window.sessionStorage.postSearchKey = searchKey;
          PostService.searchAll(searchKey).success(function(data) {
            $scope.posts = data;
          }).error(function(data, status) {
            console.log(status);
            console.log('Posts search error');
          }); 
        }
    });

    // Just by clicking on the label (in the post list)  we change public/private.
    $scope.updatePublicState = function updatePublicState(post, makePublic) {
      if (post !== undefined && makePublic !== undefined) {

        PostService.changePublicState(post._id, makePublic).success(function(data) {
          var posts = $scope.posts;
          for (var postKey in posts) {
            if (posts[postKey]._id == post._id) {
              $scope.posts[postKey].public = makePublic;
              break;
            }
          }
        });
      }
    };

}]);

appControllers.controller('PostController', ['$rootScope', '$scope', '$state' ,'$window', '$stateParams', 'flash', 'PostService', 'MarkdownToc',
  function PostController($rootScope, $scope, $state, $window, $stateParams, flash, PostService, MarkdownToc) {

  $(document).foundation();

  $scope.post = {};
  var id = $stateParams.id;

  // By clicking the edit icon we show the edit from.
  $scope.toggleForm = function () {

    // Creat new TOC.
    $scope.toc = MarkdownToc.make({_id: $scope.post._id, content: $scope.post.content});
    $scope.editForm = !$scope.editForm;

  };

  // Show edit mode if we want to create a new post.
  if ($stateParams.id === "create") {
    $scope.editForm = true;
  }

  // Add alert class on save icon
  $scope.isChanged = function() {
    $scope.saveForm = true;
  };

  // Length of mongoDb _id = 24, so it must be a existing post.
  if ($stateParams.id.length > 23) {
    PostService.read(id).then(function(data) {
      // Promise resolve
      $scope.post = data;
      $scope.toc = MarkdownToc.make(data);
    }, function(msg) {
      // Promise reject
      $scope.offline = true;
      flash('alert', msg);
    }, function(localData) {
      // Promise notify
      $scope.post = localData;
      $scope.toc = MarkdownToc.make(localData);
      $scope.offline = true;
      flash('warning', 'Offline: Post from local storage');
    });
  }

  $scope.save = function save(post) {

    $scope.editForm = false;
    $scope.saveForm = false;

    // String comma separated to array
    if (post.tags !== undefined && Object.prototype.toString.call(post.tags) !== '[object Array]') {
      post.tags = post.tags.split(',');
    }

    // If we have a _id we update the post, else we create a new post.
    if (post._id !== undefined) {

      PostService.update(post).then(function(msg) {
        // Promise reslove
        flash('success', msg);
      }, function(msg) {
        // Promise reject
        flash('alert', msg);
      });

    } else {

      PostService.create(post).then(function(msg) {
        // Promise reslove
        flash('success', msg);
        $state.go('post');
      }, function(err) {
        // Promise reject
        flash('alert', err);
      });
    }

    // Close modal if its open.
    if($("#post-settings").is(":visible")) {
      $('a.close-reveal-modal').trigger('click');
    }

  };

  $scope.deletePost = function deletePost(post) {
    PostService.delete(id).success(function(msg) {
      console.log('Deleted post:' + post._id + ' ' + msg); 
      flash('success', 'Post deleted successful');
      $state.go("post");
    });
  };

}]);

