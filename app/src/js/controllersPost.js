appControllers.controller('PostListController', ['$scope', '$state', '$window', 'flash', 'PostService', 
  function PostListController($scope, $state, $window, flash, PostService) {

    $(document).foundation();

    // Save general post settings
    $scope.saveSettings = function saveSettings() {
      $('a.close-reveal-modal').trigger('click');
      flash('success', 'Settings saved');
      $state.go('post', {}, {reload: true});
    }

    // Set post limit for all posts
    $scope.postLimit =  $window.localStorage.postLimit;
    $scope.changeLimit = function(limit) {
      $window.localStorage.postLimit =  limit;
    };

    // Hide searchFrom, toggle first.
    $scope.searchForm = false;  
    $scope.toggleSearch = function () {
      $scope.searchForm = !$scope.searchForm;
      $scope.searchKey =  $window.sessionStorage.postSearchKey;
      if ($scope.searchForm === false) {
        $state.go('post', {}, {reload: true});
      }
    };

    $scope.posts = [];

    // Get posts from MongoDb.
    PostService.findAll($window.localStorage.postLimit).success(function(data) {

      $scope.posts = data;
      // Save posts for offline.
      $window.localStorage.postsAll = JSON.stringify(data);

    }).error(function(data, status) {
      console.log('Status: ' + status);
      if(status === 0) {
        flash('alert', 'Working offline');
        if($window.localStorage.getItem('postsAll') !== null) {
          console.log('postsAll from localstorage');
          $scope.posts = JSON.parse($window.localStorage.postsAll);
        }
      }
      else {
        flash('alert', 'Error finding posts');
        $state.go('login');
      }
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
        }).error(function(status, data) {
          console.log(status);
          console.log(data);
        });
      }
    };
  }
]);

appControllers.controller('PostController', ['$rootScope', '$scope', '$state' ,'$window', '$stateParams', 'flash', 'PostService', 
  function PostController($rootScope, $scope, $state, $window, $stateParams, flash, PostService) {

  $(document).foundation();

  // By clicking the edit icon we show the edit from.
  // Hide save icon, $scope.change first.
  $scope.saveForm = false; 
  $scope.toggleForm = function () {
    $scope.editForm = !$scope.editForm;
  };

  // Show edit from if we create a new post.
  if ($stateParams.id === "create") {
    $scope.editForm = true;
  }

  // Show save icon
  $scope.isChanged = function() {
    $scope.saveForm = true;
  };

  $scope.post = {};
  var id = $stateParams.id;

  // Length of mongoDb _id = 24, so it must be a existing post.
  if ($stateParams.id.length > 23) {
    PostService.read(id).success(function(data) {
      $scope.post = data;
      $scope.toc = processToc(data);
      $window.localStorage['post_' + id] = JSON.stringify(data);
    }).error(function(data, status) {
      flash('alert', 'Post read failure');
      console.log('Status: ' + status);
      if(status === 0 && $window.localStorage.getItem('post_' + id) !== null) {
        flash('alert', 'Read only - Working offline');
        $scope.post = JSON.parse($window.localStorage['post_' + id]);
        console.log('Post from localstorage id: ' + id);
      } else {
        flash('alert', 'This post is not offline!');
        console.log('No post from localstorage id: ' + id);
      }
    });
  }

  $scope.save = function save(post) {

    // Close modal if its open.
    if($("#post-settings").is(":visible")) {
      $('a.close-reveal-modal').trigger('click');
    }

    if (post !== undefined && post.title !== undefined && post.title !== "") {

      // String comma separated to array
      if (post.tags !== undefined && Object.prototype.toString.call(post.tags) !== '[object Array]') {
        post.tags = post.tags.split(',');
      }

      // If we have a _id we update the post, else we create a new post.
      if (post._id !== undefined) {
        PostService.update(post).success(function(data) {
          $state.go("post");
          flash('success', 'Post update successful');
        }).error(function(status, data) {
          flash('alert', 'Post update failure');
          $state.go("login");
        });
      } else {
        PostService.create(post).success(function(data) {
           flash('success', 'Post create successful');
           $state.go("post");
        }).error(function(status, data) {
          if(status === 0) {
            $rootScope.online = false;
          }
          flash('alert', 'Post create failure');
        });
      }
    }
  };

  $scope.deletePost = function deletePost(post) {
    if (id !== undefined) {

      // Close model if its open
      if($("#post-settings").is(":visible")) {
        $('a.close-reveal-modal').trigger('click');
      }

      PostService.delete(id).success(function(data) {
        console.log('Deleted post:' + post._id); 
        flash('success', 'Post deleted successful');
        $state.go("post");
      });
    }
  };


  function processToc(data) {

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

      // Show TOC if we have more then 3 titles.
      if (titles.length > 3) {
        $scope.showToc = true;
      } else {
        $scope.showToc = false;
      }

      for(var i = 0; i < depths.length; i++) {
        depths[i] -= minDepth;
      }

      for(var i = 0; i < depths.length; i++) {
        toc.push(indents[depths[i]] + "- [" + titles[i].title + "](/#/post/" + id + "#" + titles[i].uri + ")");
      }
      return toc.join('\n');

    }
  }

}]);

