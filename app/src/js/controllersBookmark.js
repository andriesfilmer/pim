appControllers.controller('BookmarkListController', ['$scope', '$state', '$window', 'flash', 'BookmarkService',
  function BookmarkListController($scope, $state, $window, flash, BookmarkService) {

    var limit = $window.localStorage.bookmarkLimit;

    // Init limited bookmarks with promise.
    $scope.getBookmarks = function() {
      BookmarkService.findAll(limit)
      .then(function(response) {
        console.log('Promise resolve');
        // To show 'no bookmarks yet' in the view.
        if (response.data.length === 0) { response.data = undefined; }
        $scope.bookmarks = response.data;
      }, function(response) {
        console.log('Promise reject');
        $scope.offline = true;
        $scope.bookmarks = response.data;
        flash('warning', response.statusText);
      }, function(data) {
        console.log('Promise notify');
        $scope.bookmarks = data;
      });
    };

    // Hide searchForm, toggle first. Get saved search.
    $scope.toggleSearch = function () {
      $scope.searchForm = !$scope.searchForm;
      $scope.searchKey =  $window.sessionStorage.sessionSearchKey;
      if ($scope.searchForm) {
        $scope.searchBookmarks($window.sessionStorage.sessionSearchKey || '');
      }
      else {
        $scope.getBookmarks();
      }
    };

    // Remove search.
    $scope.resetSearch = function resetSearch() {
      delete $window.sessionStorage.sessionSearchKey;
      $scope.getBookmarks();
      $("#search input").focus();
    };

    $scope.bookmarks = [];
    $scope.getBookmarks();

    // Get new bookmarks if we change the SearchKey
    $scope.searchBookmarks = function(searchKey) {
      $window.sessionStorage.sessionSearchKey = searchKey;
      BookmarkService.searchAll(searchKey, limit).then(function(response) {
        $scope.bookmarks = response.data;
      }, function(response) {
        console.log(response.data);
        console.log('Bookmarks search error');
      }); 
    };

    // Get new bookmarks if we change the SearchKey
    $scope.$watch('searchKey', function(searchKey) {
      if (searchKey !== undefined && searchKey.length >= 3) {
        $scope.searchBookmarks(searchKey);
      }
    });

}]);

appControllers.controller('BookmarkController', ['$rootScope', '$scope', '$state' ,'$window', '$stateParams', 'flash', 'BookmarkService', 'MarkdownToc',
  function BookmarkController($rootScope, $scope, $state, $window, $stateParams, flash, BookmarkService) {

  $(document).foundation();

  // By clicking the edit icon we show the edit from.
  $scope.toggleForm = function () {
    $scope.editForm = !$scope.editForm;
  };

  // Show edit mode if we want to create a new bookmark.
  if ($state.$current.name === 'bookmark.create') {
    $scope.bookmark = {category: 'other'};
    $scope.editForm = true;
  }

  // Add alert class on save icon
  $scope.isChanged = function() {
    $scope.saveForm = true;
  };

  if ($state.$current.name === 'bookmark.view') {
    BookmarkService.read($stateParams.id)
    .then(function(response) {
      // Promise resolve
      $scope.showDeleteBt  = true;
      $scope.bookmark = response.data;
      $scope.share = shareBookmark(response.data);
    }, function(response) {
      console.log('Promise reject'); 
      $scope.offline = true;
      $scope.bookmark = response.data;
      flash('warning', response.statusText);
    });
  }

  $scope.save = function save(bookmark) {

    $scope.editForm = false;
    $scope.saveForm = false;

    // String comma separated to array
    if (bookmark.tags !== undefined && Object.prototype.toString.call(bookmark.tags) !== '[object Array]') {
      bookmark.tags = bookmark.tags.split(',');
    }

    // If we have a _id we update the bookmark, else we create a new bookmark.
    if (bookmark._id !== undefined) {
      BookmarkService.update(bookmark).then(function(response) {
        flash('success', response.data);
      }, function(response) {
        flash('alert', 'Update bookmark failure!');
      });
    }
    else {
      BookmarkService.create(bookmark).then(function(response) {
        // Promise reslove
        flash('success', response.data);
        $state.go('bookmark.list');
      }, function(response) {
        console.log(response.data);
        flash('alert', 'Create bookmark failure!');
      });
    }

  };

  $scope.deleteBookmark = function deleteBookmark(bookmark) {
    BookmarkService.delete(bookmark._id).then(function(response) {
      flash('success', response.data);
      $state.go("bookmark.list");
    }, function(response) {
      console.log(response.data);
      flash('alert', 'Delete bookmark failure');
    });
  };

  function shareBookmark(bookmark) {
    if (navigator.userAgent.match(/iPad|iPhone|Android|BlackBerry|Windows Phone|webOS/i)){
      $scope.whatsappEnabled = true;
      $scope.telegramEnabled = true;
      $scope.smsEnabled = true;
    }
    share = {};
    // http://stackoverflow.com/questions/75980/best-practice-escape-or-encodeuri-encodeuricomponent
    share.caption = encodeURI('Bookmark');
    share.title = encodeURI(bookmark.title);
    share.body  = 'Bookmark: ' + bookmark.title + '\n';
    share.body += 'Url: ' + bookmark.url + '\n\n';
    if (bookmark.content !== undefined) share.body += bookmark.content;
    share.body = encodeURIComponent(share.body);
    return share;
  }

}]);

