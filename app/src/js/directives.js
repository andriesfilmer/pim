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
    '<div ng-repeat="m in messages" class="callout {{m.level}}" data-closable>' +
        '{{m.text}}' +
        '<button class="close-button" aria-label="Dismiss alert" type="button" data-close>' +
        '<span aria-hidden="true">&times;</span>' +
        '</button>' +
    '</div>';

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

// Need for binding file to upload to scope
appDirectives.directive('bindOnChange', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.bindOnChange);
            var modelSetter = model.assign;
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);
