appControllers.controller('ContactListController', ['$scope', '$location', '$state', '$stateParams', '$window', 'flash', 'ContactService',
  function ContactListController($scope, $location, $state, $stateParams, $window, flash, ContactService) {

    // Needed for reveal dialogs. 
    $(document).foundation();

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

    // Find starred or all contacts.
    var starred = $stateParams.starred || false;
    // Find contacts with a birthdate.
    var birthdate = $stateParams.birthdate || false;

    // Order en limit vars for ContactService.findAll.
    var order = $window.localStorage.contactOrder;
    var limit = $window.localStorage.contactLimit;

    // Init starred or birthdate or limited contacts with promise.
    $scope.getContacts = function() {
      ContactService.findAll(starred, birthdate, order, limit)
      .then(function(response) {
        console.log('Promise resolve'); 

        // To show 'no contacts yet' in the view.
        if (response.data.length === 0) { response.data = undefined; }
        $scope.contacts = response.data;

        // On birthdate view scrollTo current month
        var scrollToThisMonth = ("0" + (new Date().getMonth() + 1)).slice(-2);
        $location.hash(scrollToThisMonth);
      }, function(response) {
        console.log('Promise reject'); 
        $scope.offline = true;
        $scope.contacts = response.data;
        flash('warning', response.statusText);
      }, function(data) {
        console.log('Promise notify'); 
        $scope.contacts = data;
      });
    };

    // Do we want a search form on list all contacts page.
    if ($window.sessionStorage.contactSearchKey && $state.current.name === 'contact.list') {
      $scope.searchForm = true;
      $scope.searchKey =  $window.sessionStorage.contactSearchKey;
    }
    else {
      $scope.getContacts();
    }

    // Hide searchForm, toggle first. Save/delete search in session.
    $scope.toggleSearch = function toggleSearch() {
      $scope.searchForm = !$scope.searchForm;
      if ($scope.searchForm) {
        $scope.searchKey =  $window.sessionStorage.contactSearchKey;
      }
      else {
        delete $window.sessionStorage.contactSearchKey;
        $scope.getContacts();
      }
    };

    // Remove search.
    $scope.resetSearch = function resetSearch() {
      delete $window.sessionStorage.contactSearchKey;
      $scope.getContacts();
    };

    // Get new contacts if we change the SearchKey
    $scope.$watch('searchKey', function(searchKey) {
      if (searchKey !== undefined && searchKey.length >= 3) {
        $window.sessionStorage.contactSearchKey = searchKey;
        ContactService.searchAll(birthdate, searchKey)
        .then(function(response) {
          $scope.contacts = response.data;
        }, function(response) {
          if (response.status === 0) {
            $scope.searchForm = false;
            $scope.getContacts();
          }
          else {
            $scope.offline = true;
            $scope.searchForm = false;
            flash('warning', 'Offline: Search not available');
          }
        }); 
      }
    });

    $scope.downloadContact = function downloadContacts() {
      ContactService.vCards($scope.dlPhones, $scope.dlCompanies, 
        $scope.dlEmails, $scope.dlWebsites, $scope.dlPhoto, $scope.dlAddresses, 
        $scope.dlBirthdate, $scope.dlNotes)
      .then(function(response) {
        $scope.vCardShow = true;
        $scope.downloadLabel = 'File has been created.';
        $scope.vCardLink = response.data;
      });

    };

    $scope.calculateAge = function calculateAge(birthdate) { 
        // Birthday must be a real date
        birthdate = new Date(birthdate);
        var ageDifMs = Date.now() - birthdate.getTime();
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };


}]);

appControllers.controller('ContactController', ['$scope', '$timeout', '$state' ,'$window', '$stateParams', 'flash', 'ContactService','Cropper',
  function ContactController($scope, $timeout, $state, $window, $stateParams, flash, ContactService, Cropper) {

  // Needed for reveal dialogs. 
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

  $scope.deletePhoto = function() {
    $scope.contact.photo = undefined;
    $scope.saveForm = true;
    // Todo -> remove file from server.
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
  if ($state.$current.name === 'contact.create') {
    var initializing = true;
    $scope.contact = {};
    $scope.showAddBt  = true;
    $scope.showDeleteBt  = false;
    $scope.editForm = true;
  }

  // Length of mongoDb _id = 24, so it must be a existing contact.
  if ($state.$current.name == 'contact.view') {
    console.log('Fetch contact -> _id: ' + id); 
    $scope.showAddBt  = false;
    ContactService.read(id).then(function(response) {
      console.log('Response contact and save to localStorage.'); 
      $scope.contact = response.data;
      $scope.share = shareContact(response.data);
      realBirthdate(response.data);
    }, function(response) {
      $scope.offline = true;
      $scope.contact = response.data;
      realBirthdate(response.data);
      flash('warning', response.statusText);
    }, function(data) {
      console.log('Promise notify'); 
      $scope.contact = data;
    });
  }

  // Angular in forms need a 'real' date.
  function realBirthdate(contact) {
    if (contact.birthdate !== undefined && contact.birthdate !== null) {
      $scope.contact.birthdate = new Date(contact.birthdate);
    }
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
      ContactService.create(contact).then(function(response) {
        flash('success', response.data);
        $state.go('contact.list');
      }, function(response) {
        flash('alert', 'Create contact failure');
      });
    }
    else {
      // upsert must be a 'update'
      ContactService.update(contact).then(function(response) {
        flash('success', response.data);
      }, function(response) {
        flash('alert', 'Update contact failure');
      });
    }

    // reset (close) edit form
    $scope.editForm = false;
    $scope.saveForm = false;

  };

  // Get contacts by relations if we change the SearchKey
  $scope.$watch('searchKey', function(searchKey) {
    if (searchKey !== undefined && searchKey.length >= 3) {
      ContactService.searchAll(false, searchKey).then(function(response) {
        $scope.contacts = response.data;
      }); 
    }
  });

  $scope.deleteContact = function deleteContact(contact) {
    ContactService.delete(id).then(function(response) {
      $timeout(function() {
        $state.go("contact.list");
      }, 2000);
      flash('success', response.data);
    });
  };

  $scope.calculateAge = function calculateAge(birthdate) { // birthday is a date
      var ageDifMs = Date.now() - birthdate.getTime();
      var ageDate = new Date(ageDifMs); // miliseconds from epoch
      return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Cropper for profile photos
  $scope.onFile = function(blob) {
    Cropper.encode((file = blob)).then(function(dataUrl) {
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL
      // HTMLCanvasElement.toDataURL() with only PNG and JPEG.
      fileTypeRegex = /^data:image\/(png|jpeg);base64/;
      if (!fileTypeRegex.test(dataUrl)){
        $('a.close-reveal-modal').trigger('click');
        flash('alert', 'File type not supported!');
      } else {
        $scope.dataUrl = dataUrl;
        $timeout(showCropper);  // wait for $digest to set image's src
      }
    });
  };

  function showCropper() { $scope.$broadcast($scope.showEvent); }

  $scope.cropperOptions = {
    aspectRatio: 1 / 1,
    crop: function(dataNew) {
      data = dataNew;
    }
  };

  $scope.uploadContactPhotoFile = function(contact,dataUrl) {

    $('a.close-reveal-modal').trigger('click');

    if ( (/iP(hone|od|ad)/).test(window.navigator.platform) && ($(window).width < 768 && ($(image).height() > 1000 || $(image).width() > 1000)) ) {
      flash('alert', 'Sorry, image to large (max 1000px width, 1000px heigth)');
    }
    else {

      Cropper.crop(file, data).then(function(blob) {
        return Cropper.scale(blob, {width: 250});
      }).then(Cropper.encode).then(function(dataUrl) {
        ContactService.upload(contact._id, dataUrl).then(function(response) {
          $scope.saveForm = true;
          $scope.contact.photo = response.data.contact.photo;
          $scope.upsertContact(contact, 'update');
        }, function(response) {
          flash('alert', response.data);
          $scope.contact.photo = "/static/images/profile.jpg";
        }, function(data) {
          $scope.contact.photo = data;
          $scope.editForm = false;
        }); 
      });

    }

  };

  $scope.removePhoto = function() {
    $scope.contact.photo = '';
    $scope.saveForm = true;
    $('a.close-reveal-modal').trigger('click');
    flash('success', 'Don\'t forget to save and to reload!');
  };


  // Just by clicking on the starred icon we change starred.
  $scope.updateStarredState = function updateStarredState(contact, makeStarred) {
    if (contact !== undefined && makeStarred !== undefined) {
      ContactService.changeStarredState(contact._id, makeStarred)
      .then(function(response) {
        $scope.contact.starred = makeStarred;
        flash('success', response.data);
      });
    }
  };

  $scope.downloadContact = function downloadContact(contact) {
    console.log('Download contact -> ' + contact._id); 
    ContactService.vCard(contact._id, $scope.dlPhones, $scope.dlCompanies,
      $scope.dlEmails, $scope.dlWebsites, $scope.dlPhoto, $scope.dlAddresses,
      $scope.dlBirthdate, $scope.dlNotes).then(function(response) {
        var file = new Blob([response.data], {type: 'text/x-vcard'});
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

