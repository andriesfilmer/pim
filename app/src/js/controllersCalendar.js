// Controller for calendar list events
appControllers.controller('CalendarController', ['$scope', '$timeout', '$state', '$stateParams', '$window', 'flash', 'CalendarService',
  function CalendarController($scope, $timeout, $state, $stateParams, $window, flash, CalendarService) {

  var startDate = $stateParams.start || new Date();

  // Load events (json) from CalendarService.
  $scope.events = function(start, end, timezone, callback) {
    CalendarService.find(start, end)
    .then(function(response) {
      console.log('Promise resolve');
      //console.log('CalendarService.find -> stringify(response): ' + JSON.stringify(response));
      callback(response.data);
    }, function(response) {
      console.log('Promise reject');
      $scope.offline = true;
      flash('warning', response.statusText);
      callback(response.data);
    });
  };

  // Fullcalendar options.
  $scope.uiConfig = {
    calendar:{
      timezone: 'local',
      nextDayThreshold: '00:00:01',
      editable: false,
      contentHeight: 'auto',
      aspectRatio: 0,
      firstDay: 1,
      defaultDate: startDate,
      header:{
        left: 'prevYear,prev',
        center: 'title',
        right: 'next,nextYear'
      },
      weekNumbers: true,
      draggable: false,
      dayClick: function(date, jsEvent, view) {
        // Prevent add events if offline
        if(!$scope.offline) {
          console.log('DayClick date -> ' + date);
          $state.go('calendar.new', {start: date});
        }
      },
      eventClick: function(calEvent, jsEvent, view) {
        $scope.cal = calEvent;
        $state.go('calendar.event', {id: calEvent._id});
      }
    }
  };

  // Feed events into Fullcalendar
  $scope.eventSources = [$scope.events];

  // Month, week and day view
  $scope.changeView = function(view) {
    $('#myCalendar').fullCalendar('changeView', view);
  };

  $scope.gotoToday = function() {
    $('#myCalendar').fullCalendar('today');
  };

  // Swipe left
  $scope.next = function() {
    $('#myCalendar').fullCalendar('next');
  };

  // Swipe right
  $scope.prev = function() {
    $('#myCalendar').fullCalendar('prev');
  };

  // Clicked on search icon.
  $scope.searchCalendar = function () {
    $state.go('calendar.search');
  };

  // Remove search
  $scope.resetSearchKey = function resetSearchKey() {
    delete $window.sessionStorage.sessionSearchKey;
    $state.go('calendar.search', {}, {reload: true});
    $timeout(function() { $("input").focus(); });
  };

  // Only load searched events if searchKey is defined and we are on the search page.
  $scope.searchKey =  $window.sessionStorage.sessionSearchKey;
  if ($state.$current.name === 'calendar.search' && $scope.searchKey === undefined) {
    CalendarService.find(startDate).then(function(response) {
      $scope.events = response.data;
    }, function(response) {
      console.log('Promise reject');
      flash('warning', response.statusText);
      $scope.events = response.data;
    }, function(data) {
      console.log('Promise notify search init');
      $scope.events = data;
    });
  }

  // After each searchKey change get new evenst from CalendarService.
  $scope.$watch('searchKey', function(searchKey) {
    if (searchKey !== undefined && searchKey.length >= 3 && $state.$current.name === 'calendar.search') {
      $window.sessionStorage.sessionSearchKey = searchKey;
      CalendarService.search(searchKey).then(function(response) {
        $scope.events = response.data;
      }, function(response) {
        console.log('Promise reject');
        $scope.offline = true;
        flash('warning', response.statusText);
      }, function(data) {
        console.log('Promise notify search');
        $scope.events = data;
      });
    }
  });

  if ($state.$current.name == 'calendar.import-export') {
     $scope.className = 'import';
  }

  $scope.uploadvCalendarFile = function(){
    var file = $scope.vCalendarFile;
    var className = $scope.className;
    CalendarService.uploadCalendarIcs(file, className)
    .then(function(response) {
      flash('success', response.data);
    }, function(response) {
      flash('warning', response.data);
    });
  };

  $scope.downloadCalendar = function downloadCalendar() {
    CalendarService.vevents().then(function(response) {
      var file = new Blob([response.data], {type: 'text/calendar'});
      var fileName = 'calendar.ics';
      saveAs(file, fileName);
      $scope.downloadLabel = 'File has been downloaded!';
    });

  };

}]);


// Controller for the single events
appControllers.controller('EventController', ['$scope','$timeout', '$state', '$stateParams', '$window', 'flash', 'CalendarService',
  function EventController($scope, $timeout, $state, $stateParams, $window, flash, CalendarService) {

  $(document).foundation();

  var id = $stateParams.id || 0;

  // If we enable the getHours feature.
  Date.prototype.addHours= function(h) {
    this.setHours(this.getHours()+h);
    return this;
  };

  // Hide save icon, $scope.change first.
  $scope.editForm = false;
  $scope.toggleForm = function () {
    $scope.editForm = !$scope.editForm;
  };

  if ($state.$current.name === 'calendar.version') {
    CalendarService.readVersion($stateParams.id).then(function(response) {
      console.log('Original version: ' + response.data.org_id);
      $scope.cal = checkEvent(response.data);
      $scope.cal._id = response.data.org_id;
      $scope.isChanged = true;
      flash('warning', 'Click save to restore');
    });
  }
  // ID is present so it must be a existing event.
  else if ($state.$current.name == 'calendar.event') {
    console.log('Fetch -> _id: ' + id);
    CalendarService.read(id)
    .then(function(response) {
      console.log('Promise resolve id: ' + response.data._id);
      $scope.showAddBt  = false;
      $scope.showDeleteBt  = true;
      $scope.share = shareEvent(response.data);
      $scope.cal = checkEvent(response.data);
    }, function(response) {
      console.log('Promise reject');
      $scope.offline = true;
      $scope.cal = response.data;
      flash('warning', response.statusText);
    }, function(data) {
      console.log('Promise notify');
      $scope.cal = data;
    });

    // Get event versions
    CalendarService.listVersions($stateParams.id).then(function(response) {
      $scope.versions = response.data;
    });

  }

  if ($state.$current.name == 'calendar.new') {
    console.log('INIT new event -> params.start: ' + $stateParams.start);
    var initializing = true;
    if ($stateParams.start) {
      start = $stateParams.start;
    } else {
      start = new Date();
    }
    $scope.cal = {};
    $scope.cal.start = new Date(start);
    $scope.cal.end = new Date(start);
    $scope.cal.tz = moment.tz.guess();
    $scope.tznames = moment.tz.names();
    $scope.cal.allDay = true;
    $scope.showAddBt  = true;
    $scope.editForm = true;
  }

  // If start DateTime is change we check if the end DateTime is not in the past.
  $scope.setEnd = function(cal) {
    if (cal.start >= cal.end) {
      cal.end = new Date(cal.start).addHours(1);
    }
  };

  // If we set allDay event we reset the start en end time.
  $scope.allDayChange = function(cal) {
    console.log('Switch allDay: ' + cal.allDay);
    var date = new Date(cal.start);
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    if (cal.allDay === true) {
      // For convenience we set the time on the start of the day.
      cal.start = new Date(y, m, d).addHours(9);
      cal.end = new Date(y, m, d).addHours(10);
    }
    else {
      // Remove time
      $scope.cal.start = new Date(y, m, d);
      $scope.cal.end = new Date(y, m, d);
    }
  };

  // Add or Insert a event.
  $scope.upsertEvent = function upsertEvent(cal, upsert) {

    // Insert a event
    if (upsert === 'insert') {
      CalendarService.create(cal).then(function(response) {
        $scope.editForm = false;
        $state.go('calendar.month',{start: cal.start.toISOString()});
        flash('success', response.data);
      }, function(response) {
        flash('alert', 'Event insert failure');
      });
    }

    // Update a event
    else {
      CalendarService.update(cal).then(function(response) {
        $scope.editForm = false;
        flash('success', response.data);
        $state.go('calendar.month',{start: cal.start.toISOString()});
      }, function(status, cal) {
        flash('alert', 'Event update failure');
      });
    }

  };

  $scope.deleteEvent = function deleteEvent(cal) {
    if (id !== undefined && id !== 0) {
      CalendarService.delete(id).then(function(response) {
        console.log('Deleted event:' + cal._id);
        flash('success', response.data);
        $state.go('calendar.month',{start: cal.start.toISOString()});
      }, function(response) {
        flash('alert', 'Event delete failure');
      });
    }
  };

  // Show save button/icon on change cal scope.
  $scope.$watchCollection('cal', function(oldCal, newCal) {
    if (initializing) {
      $timeout(function() { initializing = false; });
    } else {
      if (newCal !== undefined ) {
        $scope.isChanged = true;
      }
    }
  });

  $scope.downloadEvent = function downloadvevent(cal) {
    console.log('Download event -> ' + cal._id);
    CalendarService.vevent(cal._id).then(function(response) {
        var file = new Blob([response.data], {type: 'text/calendar'});
        var fileName = cal.title.replace(/[^\w]/gi, '') + '.ics';
        saveAs(file, fileName);
        $scope.downloadLabel = 'File has been downloaded!';
    });

  };

  function checkEvent(cal) {
    $scope.cal = cal;
    $scope.cal.start = new Date(cal.start);
    $scope.cal.end = new Date(cal.end);
    $scope.cal.allDay = JSON.parse(cal.allDay);
    $scope.tznames = moment.tz.names();
    offsetDb = moment.tz(cal.start, cal.tz);
    offsetGuess = moment.tz(cal.start, moment.tz.guess());

    if(offsetDb.format('Z') !== offsetGuess.format('Z')) {
      $scope.cal.tzShow = true;
      $scope.cal.tzGuess = moment.tz.guess();
      $scope.cal.tzStartDate = moment(moment.tz(cal.start, cal.tz)).format('ddd DD MMM');
      $scope.cal.tzStartTime = moment(moment.tz(cal.start, cal.tz)).format('HH:mm');
      $scope.cal.tzEndDate = moment(moment.tz(cal.end, cal.tz)).format('ddd DD MMM');
      $scope.cal.tzEndTime = moment(moment.tz(cal.end, cal.tz)).format('HH:mm');
    }
    return $scope.cal;
  }

  function shareEvent(cal) {
    if (navigator.userAgent.match(/iPad|iPhone|Android|BlackBerry|Windows Phone|webOS/i)){
      $scope.whatsappEnabled = true;
      $scope.telegramEnabled = true;
      $scope.smsEnabled = true;
    }
    share = {};
    // http://stackoverflow.com/questions/75980/best-practice-escape-or-encodeuri-encodeuricomponent
    share.caption = encodeURI('Event');
    share.title = encodeURI(cal.title);
    share.body  = 'Event: ' + cal.title + '\n';
    if (!JSON.parse(cal.allDay)) {
      share.body += 'Start: ' + cal.start.toString().substring(0,16).replace('T',' ') + '\n';
      share.body += 'End: ' + cal.end.toString().substring(0,16).replace('T',' ') + '\n\n';
    }
    else {
      share.body += 'Start: ' + cal.start.toString().substring(0,10).replace('T',' ') + '\n';
      share.body += 'End: ' + cal.end.toString().substring(0,10).replace('T',' ') + '\n\n';
    }
    if (cal.description !== undefined) share.body += cal.description;
    share.body = encodeURIComponent(share.body);
    return share;
  }

}]);


