appControllers.controller('BookmarkListController', ['$scope', '$state', '$window', 'flash', 'BookmarkService', 
  function BookmarkListController($scope, $state, $window, flash, BookmarkService) {

    $(document).foundation();

    // Restore a search key
    if ($window.sessionStorage.bookmarkSearch) {
      $scope.searchKey =  $window.sessionStorage.bookmarkSearchKey;
    }

    // Hide searchForm, toggle first. Get saved search.
    $scope.toggleSearch = function () {
      $scope.searchForm = !$scope.searchForm;
      $scope.searchKey =  $window.sessionStorage.bookmarkSearchKey;
    };

    // Remove search.
    $scope.resetSearch = function resetSearch() {
      delete $window.sessionStorage.bookmarkSearchKey;
      $state.go('bookmark', {}, {reload: true});
    };

    // Set bookmark limit for all bookmarks
    $scope.bookmarkLimit =  $window.localStorage.bookmarkLimit;
    $scope.changeLimit = function(limit) {
      $window.localStorage.bookmarkLimit =  limit;
    };

    $scope.bookmarks = [];


    // Init limited bookmarks with promise.
    BookmarkService.findAll($window.localStorage.bookmarkLimit)
    .then(function(response) {
      console.log('Promise resolve'); 
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

    // Get new bookmarks if we change the SearchKey
    $scope.$watch('searchKey', function(searchKey) {
        if (searchKey !== undefined) {
          $window.sessionStorage.bookmarkSearchKey = searchKey;
          BookmarkService.searchAll(searchKey)
          .then(function(response) {
            $scope.bookmarks = response.data;
          }, function(response) {
            console.log(response.data);
            console.log('Bookmarks search error');
          }); 
        }
    });

}]);

appControllers.controller('BookmarkController', ['$rootScope', '$scope', '$state' ,'$window', '$stateParams', 'flash', 'BookmarkService', 'MarkdownToc',
  function BookmarkController($rootScope, $scope, $state, $window, $stateParams, flash, BookmarkService) {
  $(document).foundation();

  $scope.bookmark = {};
  var id = $stateParams.id;

  // By clicking the edit icon we show the edit from.
  $scope.toggleForm = function () {
    $scope.editForm = !$scope.editForm;
  };

  // Show edit mode if we want to create a new bookmark.
  if ($stateParams.id === "create") {
    $scope.editForm = true;
  }

  // Add alert class on save icon
  $scope.isChanged = function() {
    $scope.saveForm = true;
  };

  // Length of mongoDb _id = 24, so it must be a existing bookmark.
  if ($stateParams.id.length > 23) {
    BookmarkService.read(id)
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
        flash('alert', 'Update bookmark failure');
      });
    }
    else {
      BookmarkService.create(bookmark).then(function(response) {
        // Promise reslove
        flash('success', response.data);
        $state.go('bookmark');
      }, function(response) {
        console.log(response.data);
        flash('alert', 'Create bookmark failure');
      });
    }

    // Close modal if its open.
    if($("#bookmark-settings").is(":visible")) {
      $('a.close-reveal-modal').trigger('click');
    }

  };

  $scope.deleteBookmark = function deleteBookmark(bookmark) {
    BookmarkService.delete(id).then(function(response) {
      flash('success', response.data);
      $state.go("bookmark");
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

