appControllers.controller('BookmarkListController', ['$scope', '$state', '$window', 'flash', 'BookmarkService', 
  function BookmarkListController($scope, $state, $window, flash, BookmarkService) {

    $(document).foundation();

    // Save general bookmark settings
    $scope.saveSettings = function saveSettings() {
      $('a.close-reveal-modal').trigger('click');
      flash('success', 'Settings saved');
      $state.go('bookmark', {}, {reload: true});
    };

    // Set bookmark limit for all bookmarks
    $scope.bookmarkLimit =  $window.localStorage.bookmarkLimit;
    $scope.changeLimit = function(limit) {
      $window.localStorage.bookmarkLimit =  limit;
    };

    // Hide searchForm, toggle first. Save search.
    $scope.toggleSearch = function () {
      $scope.searchForm = !$scope.searchForm;
      $scope.searchKey =  $window.sessionStorage.bookmarkSearchKey;
    };

    // Remove search.
    $scope.resetSearch = function resetSearch() {
      delete $window.sessionStorage.bookmarkSearchKey;
      $state.go('bookmark', {}, {reload: true});
    };

    $scope.bookmarks = [];

    // Init bookmarks with promises and show all bookmarks.
    $scope.init = BookmarkService.findAll($window.localStorage.bookmarkLimit).then(function(data) {
      // Promise resolved
      $scope.bookmarks = data;
    }, function(msg) {
      // Promise reject
      $scope.offline = true;
      flash('alert', msg);
    }, function(localData) {
      // Promise notify
      $scope.bookmarks = localData;
      $scope.offline = true;
      flash('warning', 'Offline: Bookmarks from local storage');
    });

    // Get new bookmarks if we change the SearchKey
    $scope.$watch('searchKey', function(searchKey) {
        if (searchKey !== undefined && searchKey.length >= 3) {
          $window.sessionStorage.bookmarkSearchKey = searchKey;
          BookmarkService.searchAll(searchKey).success(function(data) {
            $scope.bookmarks = data;
          }).error(function(data, status) {
            console.log(status);
            console.log('Bookmarks search error');
          }); 
        }
    });

    // Just by clicking on the label (in the bookmark list)  we change public/private.
    $scope.updatePublicState = function updatePublicState(bookmark, makePublic) {
      if (bookmark !== undefined && makePublic !== undefined) {

        BookmarkService.changePublicState(bookmark._id, makePublic).success(function(data) {
          var bookmarks = $scope.bookmarks;
          for (var bookmarkKey in bookmarks) {
            if (bookmarks[bookmarkKey]._id == bookmark._id) {
              $scope.bookmarks[bookmarkKey].public = makePublic;
              break;
            }
          }
        });
      }
    };

}]);

appControllers.controller('BookmarkController', ['$rootScope', '$scope', '$state' ,'$window', '$stateParams', 'flash', 'BookmarkService', 'MarkdownToc',
  function BookmarkController($rootScope, $scope, $state, $window, $stateParams, flash, BookmarkService, MarkdownToc) {
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
    BookmarkService.read(id).then(function(data) {
      // Promise resolve
      $scope.bookmark = data;
      $scope.toc = MarkdownToc.make(data);
    }, function(msg) {
      // Promise reject
      $scope.offline = true;
      flash('alert', msg);
    }, function(localData) {
      // Promise notify
      $scope.bookmark = localData;
      $scope.toc = MarkdownToc.make(localData);
      $scope.offline = true;
      flash('warning', 'Offline: Bookmark from local storage');
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

      BookmarkService.update(bookmark).then(function(msg) {
        // Promise reslove
        flash('success', msg);
      }, function(msg) {
        // Promise reject
        flash('alert', msg);
      });

    } else {

      BookmarkService.create(bookmark).then(function(msg) {
        // Promise reslove
        flash('success', msg);
        $state.go('bookmark');
      }, function(err) {
        // Promise reject
        flash('alert', err);
      });
    }

    // Close modal if its open.
    if($("#bookmark-settings").is(":visible")) {
      $('a.close-reveal-modal').trigger('click');
    }

  };

  $scope.deleteBookmark = function deleteBookmark(bookmark) {
    BookmarkService.delete(id).success(function(msg) {
      console.log('Deleted bookmark:' + bookmark._id + ' ' + msg); 
      flash('success', 'Bookmark deleted successful');
      $state.go("bookmark");
    });
  };

}]);

