appDirectives.directive('displayMessage', function() {
  return {
    restrict: 'E',
    scope: {
       	messageType: '=type',
       	message: '=data'
    },
    template: '<div class="alert {{messageType}}">{{message}}</div>',
      link: function (scope, element, attributes) {
        scope.$watch(attributes, function (value) {
        console.log(attributes);
        console.log(value);
        console.log(element[0]);
        element[0].children.hide(); 
      });
    }
  };
});

// Update the tags model with user input and comma delimited data.
appDirectives.directive('myTags', function($parse) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, elem, attrs, ngModelCtrl) {
        ngModelCtrl.$viewChangeListeners.push(function(){
           $parse(attrs.ngModel).assign(scope, ngModelCtrl.$viewValue.split(','));
        });
       }
    };
});

