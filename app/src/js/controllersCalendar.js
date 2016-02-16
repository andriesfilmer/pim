// Controller for calendar list events
appControllers.controller('CalendarController', ['$scope', '$state', '$stateParams', '$window', 'flash', 'CalendarService',
  function CalendarController($scope, $state, $stateParams, $window, flash, CalendarService) {

  var startDate = $stateParams.start || new Date();

  // Load events (json) from CalendarService.
  $scope.events = function(start, end, timezone, callback) {

    CalendarService.find(start, end)
    .then(function(response) {
      console.log('Promise resolve');
      //console.log('CalendarService -> stringEvents: ' + JSON.stringify(response.data));

      // We get a allDay false/true as string, convert it to a boolean.
      response.data.forEach(function(event) {
        event.allDay = JSON.parse(event.allDay);

        // 00:00:00 is exclusieve it don't show on the next day!
        // If allDay is true it even don't show if it is the next day !?!
        // So we have a hack for displaying multiple days in the fullcalendar
        // There must be a simpler way, but I don't get it. Is this a bug?
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
    $window.sessionStorage.clear('calendarSearchKey');
    $state.go('calendar.search', {}, {reload: true});
  };

  // Only load searched events if searchKey is defined and we are on the search page.
  $scope.searchKey =  $window.sessionStorage.calendarSearchKey;
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
      $window.sessionStorage.calendarSearchKey = searchKey;
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

}]);


// Controller for the single events
appControllers.controller('EventController', ['$scope','$timeout', '$state', '$stateParams', '$window', 'flash', 'CalendarService',
  function EventController($scope, $timeout, $state, $stateParams, $window, flash, CalendarService) {

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

  if ($state.$current.name == 'calendar.event') {
    console.log('Fetch -> _id: ' + id); 
    CalendarService.read(id)
    .then(function(response) {
      console.log('Promise resolve id: ' + response.data._id);
      $scope.showAddBt  = false;
      $scope.showDeleteBt  = true;
      $scope.share = shareEvent(response.data);
      $scope.cal = response.data;
      $scope.cal.start = new Date(response.data.start);
      $scope.cal.end = new Date(response.data.end);
      $scope.cal.allDay = JSON.parse(response.data.allDay);
      $scope.tznames = moment.tz.names();
      offsetDb = moment.tz(response.data.start, response.data.tz);
      offsetGuess = moment.tz(response.data.start, moment.tz.guess());

      if(offsetDb.format('Z') !== offsetGuess.format('Z')) {
        $scope.cal.tzShow = true;
        $scope.cal.tzGuess = moment.tz.guess(); 
        $scope.cal.tzStartDate = moment(moment.tz(response.data.start, response.data.tz)).format('ddd DD MMM'); 
        $scope.cal.tzStartTime = moment(moment.tz(response.data.start, response.data.tz)).format('HH:mm'); 
        $scope.cal.tzEndDate = moment(moment.tz(response.data.end, response.data.tz)).format('ddd DD MMM'); 
        $scope.cal.tzEndTime = moment(moment.tz(response.data.end, response.data.tz)).format('HH:mm'); 
      }

    }, function(response) {
      console.log('Promise reject');
      $scope.offline = true;
      $scope.cal = response.data;

      // Check if we have a real event with start,end and allday values.
      if(response.data.start) {
        $scope.cal.start = new Date(response.data.start);
        $scope.cal.end = new Date(response.data.end);
        $scope.cal.allDay = JSON.parse(response.data.allDay);
      }

      flash('warning', response.statusText);

    }, function(data) {
      console.log('Promise notify'); 
      $scope.cal = data;
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

