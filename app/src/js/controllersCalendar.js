// Controller for calendar or request for more events
appControllers.controller('CalendarController', ['$scope', '$state', '$stateParams', '$window', 'flash', 'CalendarService',
  function CalendarController($scope, $state, $stateParams, $window, flash, CalendarService) {

  var startDate = $stateParams.start || new Date();

  // Load events (json) from CalendarService.
  $scope.events = function(start, end, timezone, callback) {

    // Var to store events in LocalStorage with year+day io 'yyyy-dd'.
    var eventsLocalStorage = 'events_' + new Date(start).toISOString().substr(0,7);

    CalendarService.find(start, end).success(function(events) {

      //console.log('CalendarService -> stringEvents: ' + JSON.stringify(events));

      // We get a allDay false/true as string, convert it to a boolean.
      events.forEach(function(event) {
        event.allDay = JSON.parse(event.allDay);

        // 00:00:00 is exclusieve it don't show on the next day!
        // If allDay is true it even don't show if it is the next day !?!
        // So we have a hack for displaying multiple days in the fullcalendar
        // There must be a simpler way, but I don't get is. Is this a bug?
        var sDate = new Date(event.start);
        var eDate = new Date(event.end);
        var sm = sDate.getMonth();
        var sd = sDate.getDay();
        var em = eDate.getMonth();
        var ed = eDate.getDay();
        if ( sm+sd !== em+ed ) {
          event.end = new Date(eDate.getTime() + 60000);
          event.allDay = false;
        }

      });

      // Store events in LocalStorage with year+day io 'yyyy-dd'.
      $window.localStorage[eventsLocalStorage] = JSON.stringify(events);

      callback(events);

    }).error(function(data, status) {

      $scope.offline = true;
      console.log('Status error events service: ' + status);
      if(status === 0) {
        if($window.localStorage.getItem(eventsLocalStorage) !== null) {
          flash('warning', 'Offline: Events from local storage');
          callback(JSON.parse($window.localStorage[eventsLocalStorage]));
        }
        else {
          flash('alert', 'No events offline');
        }
      }
      else if(status === 401) {
        flash('alert', 'Login first');
        $state.go('signin');
      }
      else {
        flash('alert', 'Error finding events');
      }

    });

  }

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
          $state.go('calendar.event', {start: date});
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

  // Save searchKey for this session. Handy feature ;)
  $scope.searchKey =  $window.sessionStorage.calendarSearchKey;
  $scope.resetSearchKey = function resetSearchKey() {
    $window.sessionStorage.clear('calendarSearchKey');
    $state.go('calendar.search', {}, {reload: true});
  }

  // Only load searched events if searchKey is defined and we are on the search page.
  if ($state.$current.name === 'calendar.search' && $scope.searchKey === undefined) {
    CalendarService.find(startDate, '3000-01-01').success(function(events) {
      $scope.events = events;
      // Store events in LocalStorage with year+day io 'yyyy-dd'.
      $window.localStorage.eventsList = JSON.stringify(events);
    }).error(function(events, status) {
      console.log('Status error search events: ' + status);
      if(status === 0) {
        if($window.localStorage.getItem('eventsList') !== null) {
          $scope.offline = true;
          flash('warning', 'Offline: Events from local storage');
          $scope.events = JSON.parse($window.localStorage.eventsList);
        }
        else {
          flash('alert', 'No events offline');
        }
      }
      else {
        $scope.offline = true;
        flash('alert', 'Error finding events');
      }
    }); 
  }

  // After each searchKey change get new evenst from CalendarService.
  $scope.$watch('searchKey', function(searchKey) {
    if (searchKey !== undefined && searchKey.length >= 3 && $state.$current.name === 'calendar.search') {
      $window.sessionStorage.calendarSearchKey = searchKey;
      CalendarService.search(searchKey).success(function(events) {
        $scope.events = events;
      }).error(function(events, status) {
        console.log(status);
        console.log('Calendar search error');
      }); 
    }
  });

}]);

// Controller for the single events
appControllers.controller('EventController', ['$scope','$timeout', '$state', '$stateParams', '$window', 'flash', 'CalendarService',
  function EventController($scope, $timeout, $state, $stateParams, $window, flash, CalendarService) {

  var id = $stateParams.id || 0;

  $(document).foundation();

  // If we enable the getHours feature.
  Date.prototype.addHours= function(h) {
    this.setHours(this.getHours()+h);
    return this;
  }

  // Hide save icon, $scope.change first.
  $scope.editForm = false;
  $scope.toggleForm = function () {
    $scope.editForm = !$scope.editForm;
  };

  // Length of (MongoDb) _id = 24, so it must be a existing event.
  if (id.length === 24) {
    console.log('Fetch -> _id: ' + id); 
    CalendarService.read(id).success(function(cal) {
      $scope.cal = cal;
      console.log("Event id: " + cal._id);
      $scope.cal.start = new Date(cal.start);
      $scope.cal.end = new Date(cal.end);
      $scope.cal.allDay = JSON.parse(cal.allDay);
      $scope.showAddBt  = false;
      $scope.showDeleteBt  = true;
      $window.localStorage['event_' + id] = JSON.stringify(cal);
    }).error(function(cal, status) {
      console.log('Status: ' + status);
      $scope.offline = true;
      if(status === 0 && $window.localStorage.getItem('event_' + id) !== null) {
        flash('warning', 'Offline: Event from local storage');
        var cal = JSON.parse($window.localStorage['event_' + id]);
        $scope.cal = cal;
        $scope.cal.start = new Date(cal.start);
        $scope.cal.end = new Date(cal.end);
        $scope.cal.allDay = JSON.parse(cal.allDay);
      } 
      else if(status === 0) {
        flash('alert', 'This event is not offline');
      } else {
        flash('alert', 'Error event service');
      }
    });
  };

  // Must be a new event, so we init.
  if ($stateParams.start !== undefined) {
    console.log('INIT new event -> params.start: ' + $stateParams.start); 
    var initializing = true
    var start = $stateParams.start || new Date();
    $scope.cal = {};
    $scope.cal.start = new Date(start);
    $scope.cal.end = new Date(start);
    $scope.cal.allDay = true;
    $scope.showAddBt  = true;
    $scope.showDeleteBt  = false;
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
      // Remove time
      $scope.cal.start = new Date(y, m, d);
      $scope.cal.end = new Date(y, m, d);
    }
    // For convenience we set the time on the start of the day.
    else {
      cal.start = new Date(y, m, d).addHours(9);
      cal.end = new Date(y, m, d).addHours(10);
    }
  };

  // Add or Insert a event.
  $scope.upsertEvent = function upsertEvent(cal, upsert) {
    console.log('upsertEvent: ' + upsert); 
    console.log('upsertEvent title: ' + cal.title); 
    console.log('upsertEvent start: ' + cal.start); 
    console.log('upsertEvent end: ' + cal.end); 
    console.log('upsertEvent allDay: ' + cal.allDay); 
    // Insert a event
    if (upsert === 'insert') {
      CalendarService.create(cal).success(function(cal) {
      }).success(function(status, cal) {
        flash('success', 'Event created successful');
      }).error(function(status, cal) {
        flash('alert', 'Event create failure');
      });
    } 
    // Update a event
    else { 
      CalendarService.update(cal).success(function(cal) {
      }).success(function(status, cal) {
        flash('success', 'Event updated successful');
      }).error(function(status, cal) {
        flash('alert', 'Event update failure');
      });
    }
    $state.go('calendar.month',{start: cal.start.toISOString()});
    if($("#cal-settings").is(":visible")) {
      $('a.close-reveal-modal').trigger('click');
    }
  }

  $scope.deleteEvent = function deleteEvent(cal) {
    if (id !== undefined && id !== 0) {
      CalendarService.delete(id).success(function(cal) {
        console.log('Deleted event:' + cal._id); 
        flash('success', 'Event deleted successful');
      });
      $state.go('calendar.month',{start: cal.start.toISOString()});
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

}]);

