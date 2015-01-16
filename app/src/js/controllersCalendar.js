appControllers.controller('CalendarController', ['$scope', '$state', '$stateParams', '$window', 'flash', 'CalendarService',
  function CalendarController($scope, $state, $stateParams, $window, flash, CalendarService) {

  var date = new Date();
  var startDate = $stateParams.start || date;

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

  $scope.eventSources = [$scope.events];

  // Swipe left
  $scope.next = function() {
    $('#myCalendar').fullCalendar('next');
  };

  // Swipe right
  $scope.prev = function() {
    $('#myCalendar').fullCalendar('prev');
  };

  $scope.changeView = function(view) {
    $('#myCalendar').fullCalendar('changeView', view);
  };

  $scope.gotoToday = function() {
    $('#myCalendar').fullCalendar('today');
  };

  $scope.searchCalendar = function () {
    $state.go('calendar.search');
  };

  $scope.searchKey =  $window.sessionStorage.calendarSearchKey;
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

  $scope.setEnd = function(cal) {
    if (cal.start >= cal.end) {
      cal.end = cal.start;
    }
  };

  $scope.allDayChange = function(cal) {
    if (cal.allDay === true) {
      console.log('Switch allDay: ' + cal.allDay); 
      var date = new Date(cal.start);
      var d = date.getDate();
      var m = date.getMonth();
      var y = date.getFullYear();
      // Remove time
      $scope.cal.start = new Date(y, m, d); //.addHours(9);
      $scope.cal.end = new Date(y, m, d); //.addHours(10);
    }
  };

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
          flash('success', 'Event create successful');
        }).error(function(status, cal) {
          flash('alert', 'Event create failure');
        });
      } 
      // Update a event
      else { 
        CalendarService.update(cal).success(function(cal) {
        }).success(function(status, cal) {
          flash('success', 'Event update successful');
        }).error(function(status, cal) {
          flash('alert', 'Event update failure');
        });
      }
      $state.go('calendar.month',{start: cal.start.toISOString()});
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

