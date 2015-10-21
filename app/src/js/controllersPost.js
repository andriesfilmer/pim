appControllers.controller('PostListController', ['$scope', '$state', '$window', 'flash', 'PostService', 
  function PostListController($scope, $state, $window, flash, PostService) {

    $(document).foundation();

    // Do we want a search form?
    if ($window.sessionStorage.postSearch) {
      $scope.searchForm = true;
      $scope.searchKey =  $window.sessionStorage.postSearchKey;
    }

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

    // Hide searchForm, toggle first. Get saved search.
    $scope.toggleSearch = function () {
      $scope.searchForm = !$scope.searchForm;
      $scope.searchKey =  $window.sessionStorage.postSearchKey;
      if (!$scope.searchForm) {
        delete $window.sessionStorage.postSearch;
        $state.go('post', {}, {reload: true});
      } else {
        $window.sessionStorage.postSearch = true;
      }
    };

    // Remove search.
    $scope.resetSearch = function resetSearch() {
      delete $window.sessionStorage.postSearchKey;
      $scope.searchForm = true;
      $state.go('post', {}, {reload: true});
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
    PostService.readVersion($stateParams.id).then(function(data) {
      // Promise resolve
      $scope.post = data;
      $scope.post._id = data.org_id;
      $scope.toc = MarkdownToc.make(data);
      $scope.saveForm = true;
      console.log('Original version: ' + data.org_id);
      flash('alert', 'Click save to restore');
    });
  } 
  // Length of mongoDb _id = 24, so it must be a existing post.
  else if ($stateParams.id.length > 23) {
    PostService.read($stateParams.id).then(function(data) {
      // Promise resolve
      $scope.share = sharePost(data);
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

    // Get post versions
    PostService.listVersions($stateParams.id).then(function(data) {
      $scope.versions = data; // Promise resolved
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

  $scope.downloadPdf = function downloadPdf(post) {
    PostService.pdf(post._id).success(function(pdfStream) {
      var file = new Blob([pdfStream], {type: 'application/pdf'});
      var title = post.title.replace(/[^\w]/gi, '');
      saveAs(file, title + ".pdf");
      $scope.downloadPdfLabel = 'has been downloaded';
      $("#downloadPdf").removeClass( "grayscale");
   });
  };

  $scope.deletePost = function deletePost(post) {
    PostService.delete($stateParams.id).success(function(msg) {
      console.log('Deleted post:' + post._id + ' ' + msg); 
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

