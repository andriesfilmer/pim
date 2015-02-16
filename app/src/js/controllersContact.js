appControllers.controller('ContactListController', ['$scope', '$state', '$window', 'flash', 'ContactService', 
  function ContactListController($scope, $state, $window, flash, ContactService) {

    $(document).foundation();

    // Save general contact settings
    $scope.saveSettings = function saveSettings() {
      $('a.close-reveal-modal').trigger('click');
      flash('success', 'Settings saved');
      $state.go('contact', {}, {reload: true});
    };

    // Set contact limit for all contacts
    $scope.contactLimit =  $window.localStorage.contactLimit;
    $scope.changeLimit = function(limit) {
      $window.localStorage.contactLimit =  limit;
    };

    // Hide searchForm, toggle first. Save search.
    $scope.toggleSearch = function () {
      $scope.searchForm = !$scope.searchForm;
      $scope.searchKey =  $window.sessionStorage.contactSearchKey;
    };

    // Remove search.
    $scope.resetSearch = function resetSearch() {
      delete $window.sessionStorage.contactSearchKey;
    };

    $scope.contacts = [];

    // Init contacts with promises and show all contacts.
    $scope.init = ContactService.findAll($window.localStorage.contactLimit).then(function(data) {
      // Promise resolved
      $scope.contacts = data;
    }, function(msg) {
      // Promise reject
      $scope.offline = true;
      flash('alert', msg);
    }, function(localData) {
      // Promise notify
      $scope.contacts = localData;
      $scope.offline = true;
      flash('warning', 'Offline: Contacts from local storage');
    });

    // Get new contacts if we change the SearchKey
    $scope.$watch('searchKey', function(searchKey) {
        if (searchKey !== undefined && searchKey.length >= 3) {
          $window.sessionStorage.contactSearchKey = searchKey;
          ContactService.searchAll(searchKey).success(function(data) {
            $scope.contacts = data;
          }).error(function(data, status) {
            console.log(status);
            console.log('Contacts search error');
          }); 
        }
    });

    // Just by clicking on the label (in the contact list)  we change starred.
    $scope.updateStarredState = function updateStarredState(contact, makeStarred) {
      if (contact !== undefined && makeStarred !== undefined) {

        ContactService.changeStarredState(contact._id, makeStarred).success(function(data) {
          var contacts = $scope.contacts;
          for (var contactKey in contacts) {
            if (contacts[contactKey]._id == contact._id) {
              $scope.contacts[contactKey].starred = makeStarred;
              break;
            }
          }
        });
      }
    };

}]);

appControllers.controller('ContactController', ['$rootScope', '$scope', '$state' ,'$window', '$stateParams', 'flash', 'ContactService', 'MarkdownToc',
  function ContactController($rootScope, $scope, $state, $window, $stateParams, flash, ContactService, MarkdownToc) {

  $(document).foundation();

  $scope.contact = {};
  var id = $stateParams.id;

  // By clicking the edit icon we show the edit from.
  $scope.toggleForm = function () {

    // Creat new TOC should be working but it doesn't. Don't know why yet.
    //$scope.toc = MarkdownToc.make($scope.contact.content);

    $scope.editForm = !$scope.editForm;

  };

  // Show edit mode if we want to create a new contact.
  if ($stateParams.id === "create") {
    $scope.editForm = true;
  }

  // Add alert class on save icon
  $scope.isChanged = function() {
    $scope.saveForm = true;
  };

  $scope.contactPhoneOptions = ['Mobile','Home','Work','Fax','Other'];


  // Length of mongoDb _id = 24, so it must be a existing contact.
  if ($stateParams.id.length > 23) {
    ContactService.read(id).then(function(data) {
      // Promise resolve
      $scope.contact = data;
      $scope.toc = MarkdownToc.make(data);
    }, function(msg) {
      // Promise reject
      $scope.offline = true;
      flash('alert', msg);
    }, function(localData) {
      // Promise notify
      $scope.contact = localData;
      $scope.toc = MarkdownToc.make(localData);
      $scope.offline = true;
      flash('warning', 'Offline: Contact from local storage');
    });
  }

  $scope.AddField = function(type) {
    $scope.contact[type] || ($scope.contact[type] = []);
    $scope.contact[type].push({
      type: '',
      value: ''
    });
  };

  $scope.DiscardField = function(type, index) {
    if($scope.contact[type] && $scope.contact[type][index]) {
      $scope.contact[type].splice(index, 1);
    }
  };

  $scope.save = function save(contact) {

    // reset edit
    $scope.editForm = false;
    $scope.saveForm = false;

    var arrays = {'phones': [], 'emails': [], 'addresses': []};
      angular.forEach(arrays, function(v, k) {
        angular.forEach($scope.contact[k], function(val, key) {
          if(val.value.trim()) {
            arrays[k].push(val);
          }
      });
      $scope.contact[k] = arrays[k];
    });
    console.log('##### test -> phones'); 
    console.dir(contact.phones);

    // String comma separated to array
    if (contact.tags !== undefined && Object.prototype.toString.call(contact.tags) !== '[object Array]') {
      contact.tags = contact.tags.split(',');
    }

    // If we have a _id we update the contact, else we create a new contact.
    if (contact._id !== undefined) {

      ContactService.update(contact).then(function(msg) {
        // Promise reslove
        flash('success', msg);
      }, function(msg) {
        // Promise reject
        flash('alert', msg);
      });

    } else {

      ContactService.create(contact).then(function(msg) {
        // Promise reslove
        flash('success', msg);
        $state.go('contact');
      }, function(err) {
        // Promise reject
        flash('alert', err);
      });
    }

    // Close modal if its open.
    if($("#contact-settings").is(":visible")) {
      $('a.close-reveal-modal').trigger('click');
    }

  };

  $scope.deleteContact = function deleteContact(contact) {
    ContactService.delete(id).success(function(msg) {
      console.log('Deleted contact:' + contact._id + ' ' + msg); 
      flash('success', 'Contact deleted successful');
      $state.go("contact");
    });
  };

}]);

