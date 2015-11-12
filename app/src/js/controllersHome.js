// Controller for calendar or request for more events
appControllers.controller('HomeController', ['$scope', '$state', '$window', 'CalendarService', 'ContactService', 'flash', 'Utils',
  function CalendarController($scope, $state, $window, CalendarService, ContactService, flash, Utils) {

    $scope.today = new Date();
    var endDate = moment($scope.today).add(2, 'weeks');
    var eventsLocalStorage = 'events_' + new Date().toISOString().substr(0,7);

    CalendarService.find($scope.today, endDate)
    .then(function(response) {
      console.log('Promise resolve');
      // To show 'no events yet' in home view.
      if (response.data.length === 0) { response.data = undefined; }
      $scope.events = response.data;
    }, function(response) {
      console.log('Promise reject');
      $scope.offline = true;
      flash('warning', response.statusText);
      $scope.events = response.data;
    });

    ContactService.findAll(false, false ,'last_read' , 10)
    .then(function(response) {
      console.log('Promise resolve'); 
      $scope.contacts = response.data;
    }, function(response) {
      console.log('Promise reject'); 
      $scope.offline = true;
      $scope.contacts = response.data;
      flash('warning', response.statusText);
    }, function(data) {
      console.log('Promise notify'); 
      $scope.contacts = data;
    });

}]);

