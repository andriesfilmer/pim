appControllers.controller('PostListController', ['$scope', '$state', '$window', 'flash', 'PostService', 
  function PostListController($scope, $state, $window, flash, PostService) {

    $(document).foundation();

    // Restore a search key
    if ($window.sessionStorage.postSearch) {
      $scope.searchKey =  $window.sessionStorage.postSearchKey;
    }

    // Hide searchForm, toggle first. Get saved search.
    $scope.toggleSearch = function () {
      $scope.searchForm = !$scope.searchForm;
      $scope.searchKey =  $window.sessionStorage.postSearchKey;
    };

    // Remove search.
    $scope.resetSearch = function resetSearch() {
      delete $window.sessionStorage.postSearchKey;
      $state.go('post', {}, {reload: true});
    };

    // Set post limit for all posts
    $scope.postLimit =  $window.localStorage.postLimit;
    $scope.changeLimit = function(limit) {
      $window.localStorage.postLimit =  limit;
    };

    $scope.posts = [];

    // Init posts with promises and show all posts.
    PostService.findAll($window.localStorage.postLimit)
    .then(function(response) {
      console.log('Promise resolve'); 
      $scope.posts = response.data;
    }, function(response) {
      console.log('Promise reject'); 
      $scope.offline = true;
      $scope.posts = response.data;
      flash('warning', response.statusText);
    }, function(data) {
      console.log('Promise notify'); 
      $scope.posts = data;
    });

    // Get new posts if we change the SearchKey
    $scope.$watch('searchKey', function(searchKey) {
        if (searchKey !== undefined && searchKey.length >= 3) {
          $window.sessionStorage.postSearchKey = searchKey;
          PostService.searchAll(searchKey).then(function(response) {
            $scope.posts = response.data;
          }, function(response) {
            console.log(response.data);
            console.log('Posts search error');
          }); 
        }
    });

}]);

appControllers.controller('PostController', ['$rootScope', '$scope', '$state' ,'$window', '$stateParams', 'flash', 'PostService', 'MarkdownToc',
  function PostController($rootScope, $scope, $state, $window, $stateParams, flash, PostService, MarkdownToc) {

  $(document).foundation();

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

  if ($state.$current.url == "/post/version/:id") {
    $('a.close-reveal-modal').trigger('click');
    PostService.readVersion($stateParams.id).then(function(response) {
      console.log('Original version: ' + response.data.org_id);
      $scope.post = response.data;
      $scope.post._id = response.data.org_id;
      $scope.toc = MarkdownToc.make(response.data);
      $scope.saveForm = true;
      flash('warning', 'Click save to restore');
    });
  }
  // Length of mongoDb _id = 24, so it must be a existing post.
  else if ($stateParams.id.length > 23) {
    PostService.read($stateParams.id).then(function(response) {
      $scope.share = sharePost(response.data);
      $scope.post = response.data;
      $scope.toc = MarkdownToc.make(response.data);
    }, function(response) {
      console.log('Promise reject'); 
      $scope.offline = true;
      $scope.post = response.data;
      flash('warning', response.statusText);
    }, function(data) {
      console.log('Promise notify'); 
      console.dir(data);
      $scope.post = data;
    });

    // Get post versions
    PostService.listVersions($stateParams.id).then(function(response) {
      $scope.versions = response.data; 
    });
  }
  // Must be a new post so init with default params.
  else {
    $scope.post = {};
    $scope.post.type = 'todo';
    $scope.showDeleteBt = true;
  }

  $scope.save = function save(post) {

    $scope.editForm = false;
    $scope.saveForm = false;

    // Creat new TOC.
    $scope.toc = MarkdownToc.make({_id: $scope.post._id, content: $scope.post.content});

    // String comma separated to array
    if (post.tags !== undefined && Object.prototype.toString.call(post.tags) !== '[object Array]') {
      post.tags = post.tags.split(',');
    }

    // If we have a _id we update the post, else we create a new post.
    if (post._id !== undefined) {

      PostService.update(post).then(function(response) {
        flash('success', response.data);
        $state.go('post');
      }, function(response) {
        flash('alert', 'Updata post failure!');
      });

    } else {

      PostService.create(post).then(function(response) {
        flash('success', response.data);
        $state.go('post');
      }, function(response) {
        flash('alert', 'Create post failure!');
      });
    }

    // Close modal if its open.
    if($("#post-settings").is(":visible")) {
      $('a.close-reveal-modal').trigger('click');
    }

  };

  $scope.downloadPdf = function downloadPdf(post) {
    PostService.pdf(post._id).then(function(response) {
      console.log('##### test -> '); 
      console.dir(response.data);
      var file = new Blob([response.data], {type: 'application/pdf'});
      var title = post.title.replace(/[^\w]/gi, '');
      saveAs(file, title + ".pdf");
      $scope.downloadLabel = 'has been downloaded';
      $("#downloadPdf").removeClass( "grayscale");
   });
  };

  $scope.deletePost = function deletePost(post) {
    PostService.delete($stateParams.id).then(function(response) {
      console.log('Deleted post:' + post._id + ' ' + respomse.statusText); 
      flash('success', 'Post deleted successful');
      $state.go("post");
    });
  };

  function sharePost(post) {
    if (navigator.userAgent.match(/iPad|iPhone|Android|BlackBerry|Windows Phone|webOS/i)){
      $scope.whatsappEnabled = true;
      $scope.telegramEnabled = true;
      $scope.smsEnabled = true;
    }
    share = {};
    share.caption = encodeURI('Post');
    share.title = encodeURI(post.title);
    share.body  = 'Post: ' + post.title + '\n';
    if (post.content !== undefined) share.body += post.content;
    share.body = encodeURIComponent(share.body);
    return share;
  }

}]);

