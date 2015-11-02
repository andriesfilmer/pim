// Controller for calendar or request for more events
appControllers.controller('HomeController', ['$scope', '$state', '$window', 'CalendarService', 'ContactService', 'flash',
  function CalendarController($scope, $state, $window, CalendarService, ContactService, flash) {

    var startDate = new Date();
    var endDate = moment(startDate).add(2, 'weeks');
    var eventsLocalStorage = 'events_' + new Date().toISOString().substr(0,7);

    CalendarService.find(startDate, endDate).success(function(events) {

      // To show 'no events yet' in home view.
      if (events.length === 0) { events = undefined; }

      $scope.events = events;

    }).error(function(events, status) {
      $scope.offline = true;
      console.log('Status error events service: ' + status);
      if(status === 0) {
        if($window.localStorage.getItem(eventsLocalStorage) !== null) {
          flash('warning', 'Offline: Data from local storage');
          $scope.events =  JSON.parse($window.localStorage[eventsLocalStorage]);
        }
        else {
          flash('alert', 'No data offline.');
        }
      }
    }); 

    ContactService.findAll(false, false ,'last_read' , 7)
    .then(function(contacts) {
      $scope.contacts = contacts;
    }, function(msg) {
      // Promise reject
      $scope.offline = true;
      flash('alert', msg);
    }, function() {
      // Promise notify
      $scope.offline = true;
      flash('warning', 'Offline: Data from local storage');
      $scope.contacts =  JSON.parse($window.localStorage['contactsAll']);
    });

}]);

