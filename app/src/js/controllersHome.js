// Controller for calendar or request for more events
appControllers.controller('HomeController', ['$scope', '$state', '$window', 'CalendarService', 'ContactService', 'flash', 'Utils',
  function CalendarController($scope, $state, $window, CalendarService, ContactService, flash, Utils) {

    $scope.today = new Date();
    var startDate = moment().format('YYYY-MM-DD');
    var endDate = moment().add(2, 'weeks').format('YYYY-MM-DD');

    CalendarService.find(startDate, endDate, false) // start, end, saveLocal
    .then(function(response) {
      console.log('Promise resolve');
      // To show 'no events yet' in home view.
      if (response.data.length === 0) { response.data = undefined; }
      $scope.events = response.data;
    }, function(response) {
      console.log('Promise reject');
      $scope.offline = true;
      $scope.events = response.data;
    }, function(data) {
      console.log('Promise notify'); 
      $scope.events = data;
    });

    ContactService.findAll(false, false ,'last_read' , 10, false)
    .then(function(response) {
      console.log('Promise resolve'); 
      $scope.contacts = response.data;
    }, function(response) {
      console.log('Promise reject'); 
      $scope.offline = true;
      $scope.contacts = response.data;
      flash('warning', 'Offline: data from localstorage');
    }, function(data) {
      console.log('Promise notify'); 
      $scope.contacts = data;
    });

}]);

