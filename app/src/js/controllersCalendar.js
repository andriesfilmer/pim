// Controller for calendar or request for more events
appControllers.controller('CalendarController', ['$scope', '$state', '$stateParams', '$window', 'flash', 'CalendarService',
  function CalendarController($scope, $state, $stateParams, $window, flash, CalendarService) {

  var date = new Date();
  var startDate = $stateParams.start || date;

  // Load events (json) from mongodb.
  $scope.events = function(start, end, timezone, callback) {
    CalendarService.findAll(start, end).success(function(events) {

      //console.log('CalendarService -> stringEvents: ' + JSON.stringify(events));

      // We get a allDay false/true as string, convert it to a boolean.
      events.forEach(function(event) {
        event.allDay = JSON.parse(event.allDay);
      });
      $window.localStorage['eventsAll'] = JSON.stringify(events);
      callback(events);
    });
  }

  // Fullcalendar options.
  $scope.uiConfig = {
    calendar:{
      timezone: 'local',
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
        console.log('DayClick date -> ' + date); 
        $state.go('calendar.event', {start: date});
      },
      eventClick: function(calEvent, jsEvent, view) {
        $scope.cal = calEvent;
        console.log('EventClick date -> ' + date); 
        $state.go('calendar.event', {id: calEvent._id});
      }
    }
  };

  // Feed events into Fullcalendar
  $scope.eventSources = [$scope.events];

  // Swipe left
  $scope.next = function() {
    $('#myCalendar').fullCalendar('next');
  };

  // Swipe right
  $scope.prev = function() {
    $('#myCalendar').fullCalendar('prev');
  };

  // Month, week and day view
  $scope.changeView = function(view) {
    $('#myCalendar').fullCalendar('changeView', view);
  };

  $scope.gotoToday = function() {
    $('#myCalendar').fullCalendar('today');
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
    CalendarService.findAll(date, '3016-01-17T09:36:47.362Z').success(function(events) {
      $scope.events = events;
    }).error(function(events, status) {
      console.log(status);
      console.log('Calendar search error');
    }); 
  }

  // After each searchKey change get new evenst from MongoDb.
  $scope.$watch('searchKey', function(searchKey) {
      if (searchKey !== undefined && searchKey.length >= 3) {
        $window.sessionStorage.calendarSearchKey = searchKey;
        CalendarService.searchAll(searchKey).success(function(events) {
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
  var date = new Date();

  $(document).foundation();

  Date.prototype.addHours= function(h) {
    this.setHours(this.getHours()+h);
    return this;
  }

  // Length of mongoDb _id = 24, so it must be a existing event.
  if (id.length === 24) {
    console.log('Fetch -> _id: ' + id); 
    CalendarService.read(id).success(function(cal) {
      $scope.cal = cal;
      console.log("Event id: " + cal._id);
      console.dir(cal); 
      $scope.cal.start = new Date(cal.start);
      $scope.cal.end = new Date(cal.end);
      $scope.cal.allDay = JSON.parse(cal.allDay);
      $scope.showAddBt  = false;
      $scope.showDeleteBt  = true;
      $window.localStorage['event_' + id] = JSON.stringify(cal);
    }).error(function(cal, status) {
      flash('alert', 'Event read failure');
      console.log('Status: ' + status);
      if(status === 0 && $window.localStorage.getItem('event_' + id) !== null) {
        flash('alert', 'Read only - Working offline');
        $scope.cal = JSON.parse($window.localStorage['event_' + id]);
        console.log('Event from localstorage id: ' + id);
      } else {
        flash('alert', 'This event is not offline!');
        console.log('No event from localstorage id: ' + id);
      }
    });
  };

  // Must be a new event, so we init.
  if ($stateParams.start !== undefined) {
    console.log('INIT new event -> params.start: ' + $stateParams.start); 
    var start = $stateParams.start || date;
    var initializing = true
    $scope.cal = {};
    $scope.cal.start = new Date(start);
    $scope.cal.end = new Date(start);
    $scope.cal.allDay = true;
    $scope.showAddBt  = true;
    $scope.showDeleteBt  = false;
  }

  // If start DateTime is change we check if the end DateTime is not in the past.
  $scope.setEnd = function(cal) {
    if (cal.start >= cal.end) {
      cal.end = cal.start;
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
    // For convenience we set the time on the middle of the day.
    //else
    //  $scope.cal.start = new Date(y, m, d).addHours(12);
    //  $scope.cal.end = new Date(y, m, d).addHours(13);
    //
  };

  // Add or Insert a event.
  $scope.upsertEvent = function upsertEvent(cal, upsert) {
    if (cal.title !== undefined && cal.start !== undefined) {
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
    else {
      flash('alert', 'Event title required');
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

