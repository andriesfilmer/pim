//appDirectives.directive('displayMessage', function() {
//  return {
//    restrict: 'E',
//    scope: {
//       	messageType: '=type',
//       	message: '=data'
//    },
//    template: '<div class="alert {{messageType}}">{{message}}</div>',
//      link: function (scope, element, attributes) {
//        scope.$watch(attributes, function (value) {
//        console.log(attributes);
//        console.log(value);
//        console.log(element[0]);
//        element[0].children.hide(); 
//      });
//    }
//  };
//});


// Update the tags model with user input and comma delimited data.
// Not inplemented yet......
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

appDirectives.directive('markdown', function (markdownConverter) {
    return {
      restrict: 'AE',
      link: function (scope, element, attrs) {
        if (attrs.markdown) {
          scope.$watch(attrs.markdown, function (newVal) {
            var html = newVal ? markdownConverter.makeHtml(newVal) : '';
            element.html(html);
          });
        } else {
          var html = markdownConverter.makeHtml(element.text());
          element.html(html);
        }
      }
    };
});

// Thanks to: https://github.com/gtramontina/angular-flash
appDirectives.directive('flashMessages', [function() {
  var directive = { restrict: 'EA', replace: true };
  directive.template =
    '<ol id="flash-messages">' +
      '<li ng-repeat="m in messages" class="alert-box {{m.level}}">{{m.text}}</li>' +
    '</ol>';

  directive.controller = ['$scope', '$rootScope', function($scope, $rootScope) {
    $rootScope.$on('flash:message', function(_, messages, done) {
      $scope.messages = messages;
      done();
    });
  }];

  return directive;
}]);

appDirectives.directive('confirmationNeeded', function () {
  return {
    priority: 1,
    terminal: true,
    link: function (scope, element, attr) {
      var msg = attr.confirmationNeeded || "Are you sure?";
      var clickAction = attr.ngClick;
      element.bind('click',function () {
        if ( window.confirm(msg) ) {
          scope.$eval(clickAction)
        }
      });
    }
  };
});
