appControllers.controller('PostListController', ['$scope', '$state', '$window', 'flash', 'PostService',
  function PostListController($scope, $state, $window, flash, PostService) {

    var limit = $window.localStorage.postLimit;

    // Init posts with promises and show all posts.
    $scope.getPosts = function() {
      PostService.findAll(limit)
      .then(function(response) {
        console.log('Promise resolve');
        // To show 'no posts yet' in the view.
        if (response.data.length === 0) { response.data = undefined; }
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
    };

    // Hide searchForm, toggle first. Get saved search.
    $scope.toggleSearch = function () {
      $scope.searchForm = !$scope.searchForm;
      $scope.searchKey =  $window.sessionStorage.sessionSearchKey;
      if ($scope.searchForm) {
        $scope.searchPosts($scope.sessionSearchKey || '');
      }
      else {
        $scope.getPosts($scope.searchPosts);
      }
    };

    // Remove search.
    $scope.resetSearch = function resetSearch() {
      delete $window.sessionStorage.sessionSearchKey;
      $scope.getPosts();
      $("#search input").focus();
    };

    $scope.posts = [];
    $scope.getPosts();

    // Get new posts if we change the SearchKey
    $scope.searchPosts = function(searchKey) {
       $window.sessionStorage.sessionSearchKey = searchKey;
       PostService.searchAll(searchKey, limit).then(function(response) {
         $scope.posts = response.data;
       }, function(response) {
         console.log(response.data);
         console.log('Posts search error');
       });
    };

    // Get new posts if we change the SearchKey
    $scope.$watch('searchKey', function(searchKey) {
      if (searchKey !== undefined && searchKey.length >= 3) {
        $scope.searchPosts(searchKey);
      }
    });

}]);

appControllers.controller('PostController', ['$scope', '$state' ,'$window', '$stateParams', 'flash', 'PostService', 'MarkdownToc',
  function PostController($scope, $state, $window, $stateParams, flash, PostService, MarkdownToc) {

  $(document).foundation();

  // By clicking the edit icon we show the edit from.
  $scope.toggleForm = function () {

    // Create new TOC.
    $scope.toc = MarkdownToc.make({_id: $scope.post._id, content: $scope.post.content});
    $scope.editForm = !$scope.editForm;

  };

  // Add alert class on save icon
  $scope.isChanged = function() {
    $scope.saveForm = true;
  };

  if ($state.$current.name === 'post.version') {
    PostService.readVersion($stateParams.id).then(function(response) {
      console.log('Original version: ' + response.data.org_id);
      $scope.post = response.data;
      $scope.post._id = response.data.org_id;
      $scope.toc = MarkdownToc.make(response.data);
      $scope.saveForm = true;
      flash('warning', 'Click save to restore');
    });
  }
  // ID is present so it must be a existing post.
  else if ($state.$current.name == 'post.view') {
    console.log('Fetch post -> _id: ' + $stateParams.id);
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
      $scope.post = data;
    });

    // Get post versions
    PostService.listVersions($stateParams.id).then(function(response) {
      $scope.versions = response.data;
    });

  }
  // Must be a new post so init with default values.
  else  {
    $scope.post = {};
    $scope.post.type = 'todo';
    $scope.showDeleteBt = true;
    $scope.editForm = true;
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
      }, function(response) {
        flash('alert', 'Updata post failure!');
      });

    } else {

      PostService.create(post).then(function(response) {
        flash('success', response.data);
      }, function(response) {
        flash('alert', 'Create post failure!');
      });
    }

  };

  $scope.downloadPdf = function downloadPdf(post) {
    PostService.pdf(post._id).then(function(response) {
      var file = new Blob([response.data], {type: 'application/pdf'});
      var title = post.title.replace(/[^\w]/gi, '');
      saveAs(file, title + ".pdf");
      $scope.downloadLabel = 'has been downloaded';
      $("#downloadPdf").removeClass( "grayscale");
   });
  };

  $scope.deletePost = function deletePost(post) {
    PostService.delete(post._id).then(function(response) {
      console.log('Deleted post:' + post._id + ' ' + response.statusText);
      flash('success', 'Post deleted successful');
      $state.go("post.list");
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

