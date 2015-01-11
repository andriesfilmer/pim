appControllers.controller('CalendarController', ['$scope', '$state', '$window', 'flash', 'CalendarService',
  function CalendarController($scope, $state, $window, flash, CalendarService) {

  var date = new Date();

  $scope.events = function(start, end, timezone, callback) {
    CalendarService.findAll().success(function(events) {
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
      editable: true,
      contentHeight: 'auto',
      aspectRatio: 0,
      firstDay: 1,
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

  $scope.changeView = function(view) {
    $('#myCalendar').fullCalendar('changeView', view);
  };

  $scope.gotoToday = function() {
    $('#myCalendar').fullCalendar('today');
  };

}]);

appControllers.controller('EventController', ['$scope', '$state', '$stateParams', '$window', 'flash', 'CalendarService',
  function EventController($scope, $state, $stateParams, $window, flash, CalendarService) {

  var id = $stateParams.id || 0;
  var date = new Date();

  Date.prototype.addHours= function(h) {
    this.setHours(this.getHours()+h);
    return this;
  }

  // Length of mongoDb _id = 24, so it must be a existing event.
  if (id.length === 24) {
    console.log('Fetch -> _id: ' + id); 
    CalendarService.read(id).success(function(data) {
      $scope.cal = data;
      console.log("Event id: " + data._id);
      $scope.cal.start = new Date(data.start);
      $scope.cal.end = new Date(data.end);
      $scope.cal.allDay = JSON.parse(data.allDay);
      $scope.showAddBt  = false;
      $scope.cal.showDeleteBt  = true;
      $window.localStorage['event_' + id] = JSON.stringify(data);
    }).error(function(data, status) {
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
    $scope.cal = {};
    $scope.cal.start = new Date(start);
    $scope.cal.end = new Date(start);
    $scope.cal.allDay = true;
    $scope.showAddBt  = true;
    $scope.cal.showDeleteBt  = false;
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

  $scope.addEvent = function addEvent(cal) {
    if (cal.title !== undefined) {
      console.log('addEvent: ' + cal.title); 
      console.log('addEvent start: ' + cal.start); 
      console.log('addEvent end: ' + cal.end); 
      console.log('addEvent allDay: ' + cal.allDay); 
      CalendarService.create(cal).success(function(data) {
         flash('success', 'Event create successful');
      }).error(function(status, data) {
        flash('alert', 'Event create failure');
      });
      $state.go('calendar.month');
    }
    else {
      flash('alert', 'Event title required');
    }
  }

  $scope.updateEvent = function updateEvent(cal) {
    $('a.close-reveal-modal').trigger('click');
    if (cal.title !== undefined) {
      console.log('updateEvent: ' + cal.title); 
      console.log('updateEvent start: ' + cal.start); 
      console.log('updateEvent end: ' + cal.end); 
      console.log('updateEvent allDay: ' + cal.allDay); 
      CalendarService.update(cal).success(function(data) {
        flash('success', 'Event update successful');
        $state.go('calendar.month');
      });
    }
  }

  $scope.deleteEvent = function deleteEvent(cal) {
    if (id !== undefined && id !== 0) {
      CalendarService.delete(id).success(function(data) {
        console.log('Deleted event:' + cal._id); 
        flash('success', 'Event deleted successful');
        $state.go("calendar.month");
      });
    }
  };

}]);

