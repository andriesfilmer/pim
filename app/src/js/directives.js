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
      '<li ng-repeat="m in messages" class="alert-box {{m.level}}">{{m.text}} <a href="#" class="close">&times;</a></li>' +
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
          scope.$eval(clickAction);
        }
      });
    }
  };
});

appDirectives.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

// Need a focus after ng-click hide/show
appDirectives.directive('focusMe', function($timeout) {
  return {
    scope: { trigger: '=focusMe' },
    link: function(scope, element) {
      scope.$watch('trigger', function(value) {
        if(value === true) { 
          $timeout(function() {
            element[0].focus();
          });
        }
      });
    }
  };
});

// Add Target _blank to href
appDirectives.directive('href', function() {
  return {
    compile: function(element) {
      // Add target _blank if its a http url.
      var patt = new RegExp(/^http:*/i);
      if (patt.test(element[0].href)) {
        console.log('Added element -> target=_blank: ' + element[0].href); 
        element.attr('target', '_blank');
      }
    }
  };
});
