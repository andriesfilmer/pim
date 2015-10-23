appControllers.controller('ContactListController', ['$scope', '$state', '$stateParams', '$window', 'flash', 'ContactService', 
  function ContactListController($scope, $state, $stateParams, $window, flash, ContactService) {

    $(document).foundation();

    // Do we want a search form?
    if ($window.sessionStorage.contactSearch) {
      $scope.searchForm = true;
      $scope.searchKey =  $window.sessionStorage.contactSearchKey;
    }

    // Set contact limit for contacts
    $scope.contactLimit =  $window.localStorage.contactLimit;
    $scope.changeLimit = function(limit) {
      $window.localStorage.contactLimit =  limit;
    };

    // Set contact order for contacts
    $scope.contactOrder =  $window.localStorage.contactOrder;
    $scope.changeOrder = function(order) {
      $window.localStorage.contactOrder =  order;
    };

    // Hide searchForm, toggle first. Save search.
    $scope.toggleSearch = function toggleSearch(birthdate) {
      $scope.searchForm = !$scope.searchForm;
      $scope.searchKey =  $window.sessionStorage.contactSearchKey;
      // Search only contacts with a birtdate.
      $stateParams.birthdate = birthdate;
      if (!$scope.searchForm) {
        delete $window.sessionStorage.contactSearch;
        $state.go('contact.list', {}, {reload: true});
      } else {
        $window.sessionStorage.contactSearch = true;
      }
    };

    // Remove search.
    $scope.resetSearch = function resetSearch() {
      delete $window.sessionStorage.contactSearchKey;
      $scope.searchForm = true;
      $state.go('contact.list', {}, {reload: true});
    };

    $scope.contacts = [];

    // Find starred or all contacts.
    var starred = $stateParams.starred || false;
    // Find contacts with a birthdate.
    var birthdate = $stateParams.birthdate || false;

    // Init contacts with promises and show all contacts.
    $scope.init = ContactService.findAll(starred, birthdate, $window.localStorage.contactOrder, $window.localStorage.contactLimit)
    .then(function(data) {
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
          ContactService.searchAll(birthdate, searchKey).success(function(data) {
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

    $scope.downloadContact = function downloadContacts() {
      ContactService.vCards($scope.dlPhones, $scope.dlCompanies,
          $scope.dlEmails, $scope.dlWebsites, $scope.dlPhoto, $scope.dlAddresses,
          $scope.dlBirthdate, $scope.dlNotes).success(function(link) {
        $scope.vCardShow = true;
        $scope.downloadLabel = 'File has been created.';
        $scope.vCardLink = '/download/' + link;
      });

    };

    $scope.calculateAge = function calculateAge(birthdate) { // birthday is a date
        birthdate = new Date(birthdate);
        var ageDifMs = Date.now() - birthdate.getTime();
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };


}]);

appControllers.controller('ContactController', ['$scope', '$timeout', '$state' ,'$window', '$stateParams', 'flash', 'ContactService', 'FileUpload', 'usSpinnerService',
  function ContactController($scope, $timeout, $state, $window, $stateParams, flash, ContactService, FileUpload, usSpinnerService) {

  $(document).foundation();

  var id = $stateParams.id;

  // By clicking the edit icon we show the edit from.
  $scope.toggleForm = function () {
    $scope.editForm = !$scope.editForm;
  };

  // Array's for labels on select boxes
  $scope.contactPhoneOptions = ['Mobile','Home','Work','Fax','Other'];
  $scope.contactRelationOptions = ['Family','Friend','Business','Other'];
  $scope.contactEmailOptions = ['Personal','Home','Work','Other'];
  $scope.contactWebsiteOptions = ['Personal','Work','Social','Other'];
  $scope.contactAddressOptions = ['Home','Work','Other'];

  $scope.isChanged = function() {
    // Add alert class on save icon
    $scope.saveForm = true;
  };

  $scope.labelChanged = function(type, idx, value) {

    // After a selection of the default 'select boxes' (zie above) we
    // make it a 'custom' input field. So you can add more options.
    // The magic is done with `ng-class` in the view (partial).
    $scope.customValue = value;

    // Show placeholder
    if (value === 'Other') {
      $scope.customValue = '';
      if (type === 'phones')   { $scope.contact.phones[idx].type = '';}
      if (type === 'emails')    { $scope.contact.emails[idx].type = '';}
      if (type === 'websites')  { $scope.contact.websites[idx].type = '';}
      if (type === 'addresses') { $scope.contact.addresses[idx].type = '';}
      if (type === 'relations') { $scope.contact.relations[idx].type = '';}
    }

    // Add alert class on save icon
    $scope.saveForm = true;

  };

  // Init a new contact.
  if ($stateParams.id === "create") {
    var initializing = true;
    $scope.contact = {};
    $scope.showAddBt  = true;
    $scope.showDeleteBt  = false;
    $scope.editForm = true;
  }

  // Length of mongoDb _id = 24, so it must be a existing contact.
  if ($stateParams.id.length > 23) {
    console.log('Fetch contact -> _id: ' + id); 
    ContactService.read(id).then(function(data) {
      // Promise resolve
      $scope.contact = data;
      $scope.share = shareContact(data);
      if (data.birthdate !== undefined && data.birthdate !== null) {
        // Angular in forms need a 'real' date.
        $scope.contact.birthdate = new Date(data.birthdate);
      }
      $scope.showAddBt  = false;
    }, function(msg) {
      // Promise reject
      $scope.offline = true;
      flash('alert', msg);
    }, function(localData) {
      // Promise notify
      $scope.contact = localData;
      $scope.offline = true;
      flash('warning', 'Offline: Contact from local storage');
    });
  }

  // Add/push (+) phone, compagy, email, address or website field.
  $scope.AddField = function(type) {
    if ($scope.contact[type] === undefined) {
      $scope.contact[type] = [];
    }
    $scope.contact[type].push({});
    $scope.customValue = '';
  };

  // Add (push) relation with id/link to other contact.
  $scope.AddRelation = function(id, name) {
    if ($scope.contact.relations === undefined) {
      $scope.contact.relations = [];
    }
    $scope.contact.relations.push({
      id: id,
      value: name,
      type: ''
    });
    $scope.saveForm = true;
    $('a.close-reveal-modal').trigger('click');
  };

  // Remove (X) phone, email, relation, address or website field.
  $scope.DiscardField = function(type, index) {
    if($scope.contact[type] && $scope.contact[type][index]) {
      $scope.contact[type].splice(index, 1);
    }
    $scope.saveForm = true;
  };

  // Update of insert a contact
  $scope.upsertContact = function upsertContact(contact, upsert) {

    // Store birthdates with the same time so we can run a crontab once a day
    //if(contact.birthdate !== undefined && contact.birthdate !== null) 
    //  $scope.birthdate = contact.birthdate.toISOString().substr(0, 10) + "T00:00:00Z";
    //  contact.birthdate = new Date($scope.birthdate); 
    //

    // Create array's from db
    var arrays = {'phones': [], 'emails': [], 'addresses': [], 'websites': []};
    angular.forEach(arrays, function(v, k) {
      angular.forEach($scope.contact[k], function(val, key) {
        if(val.value.trim()) {
          arrays[k].push(val);
        }
      });
      $scope.contact[k] = arrays[k];
    });

    // Remove non numeric numbers to store in db, so we can search on phonenumbers.
    angular.forEach($scope.contact.phones, function(val, key) {
      $scope.contact.phones[key].value = val.value.replace(/[^\d\+]/g, "");
    });

    // If we have a _id we update the contact, else we create (insert) a new contact.
    if (upsert === 'insert') {
      ContactService.create(contact).then(function(msg) {
        // Promise reslove
        flash('success', msg);
        $state.go('contact.list');
      }, function(err) {
        // Promise reject
        flash('alert', err);
      });
    }
    else {
      // upsert must be a 'update'
      ContactService.update(contact).then(function(msg) {
        // Promise reslove
        flash('success', msg);
      }, function(msg) {
        // Promise reject
        flash('alert', msg);
      });
    }

    // reset (close) edit form
    $scope.editForm = false;
    $scope.saveForm = false;

  };

  // Get contacts by relations if we change the SearchKey
  $scope.$watch('searchKey', function(searchKey) {
    if (searchKey !== undefined && searchKey.length >= 3) {
      ContactService.searchAll(false, searchKey).success(function(data) {
        $scope.contacts = data;
      }).error(function(data, status) {
        console.log(status);
        console.log('Contacts relations search error');
      }); 
    }
  });

  $scope.deleteContact = function deleteContact(contact) {
    ContactService.delete(id).success(function(msg) {
      console.log('Deleted contact:' + contact._id + ' ' + msg); 
      flash('success', 'Contact deleted successful');
      $state.go("contact.list");
    });
  };

  $scope.calculateAge = function calculateAge(birthdate) { // birthday is a date
      var ageDifMs = Date.now() - birthdate.getTime();
      var ageDate = new Date(ageDifMs); // miliseconds from epoch
      return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  $scope.uploadContactPhotoFile = function(){
    var file = $scope.contactPhoto;
    var uploadUrl = "/fileupload";
    var filename = $scope.contact._id;

    // Show spinner while uploading.
    $scope.uploadProcess = true;
    usSpinnerService.spin('spinner-1');
    if (file.type === "image/png") {
      filename += ".png";
    }
    else {
      filename += ".jpg";
    }

    FileUpload.uploadFileToUrl(file, uploadUrl, filename);

    // Wait 3 seconds for scope update.
    $timeout( function(){ 
      if(file) {
        $scope.contact.photo = "/upload/contact_photos/" + filename;
      }
      $scope.uploadProcess = false;
      $scope.saveForm = true;
      usSpinnerService.stop('spinner-1');
    }, 3000);

  };

  // Just by clicking on the starred icon we change starred.
  $scope.updateStarredState = function updateStarredState(contact, makeStarred) {
    if (contact !== undefined && makeStarred !== undefined) {
      ContactService.changeStarredState(contact._id, makeStarred).success(function(data) {
        $scope.contact.starred = makeStarred;
      });
    }
  };

  $scope.downloadContact = function downloadContact(contact) {
    console.log('##### contact._id -> ' + contact._id); 
    ContactService.vCard(contact._id, $scope.dlPhones, $scope.dlCompanies,
      $scope.dlEmails, $scope.dlWebsites, $scope.dlPhoto, $scope.dlAddresses,
      $scope.dlBirthdate, $scope.dlNotes).success(function(vCardStream) {
        var file = new Blob([vCardStream], {type: 'text/x-vcard'});
        var fileName = contact.name.replace(/[^\w]/gi, '') + '.vcf';
        saveAs(file, fileName);
        $scope.downloadLabel = 'File has been downloaded!';
    });

  };

  function shareContact(contact) {
    if (navigator.userAgent.match(/iPad|iPhone|Android|BlackBerry|Windows Phone|webOS/i)){
      $scope.whatsappEnabled = true;
      $scope.telegramEnabled = true;
      $scope.smsEnabled = true;
    }
    share = {};
    share.caption = encodeURI('Contact');
    share.title = encodeURI(contact.name);
    share.body  = 'Contact: ' + contact.name + '\n\n';
    if (contact.phones.length > 0) {
      contact.phones.forEach(function(phone) {
        share.body += 'Phone ' + phone.type + ': ' + phone.value + "\n";
      });
    }
    if (contact.companies.length > 0) {
      contact.companies.forEach(function(company) {
        share.body += 'Company ' + company.title + ': ' + company.name + "\n";
      });
    }
    if (contact.emails.length > 0) {
      contact.emails.forEach(function(email) {
        share.body += 'Email ' + email.type + ': ' + email.value + "\n";
      });
    }
    if (contact.addresses.length > 0) {
      contact.addresses.forEach(function(address) {
        share.body += 'Address ' + address.type + ': ' + address.value + "\n";
      });
    }
    if (contact.notes !== undefined ) share.body += '\n\n' + contact.notes;

    share.body = encodeURIComponent(share.body);
    return share;
  }

}]);

