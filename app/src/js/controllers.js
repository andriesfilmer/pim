appControllers.controller('CalendarController', ['$rootScope','$scope', '$filter', 'flash',
  function CalendarController($scope, $filter, flash) {

  $(document).foundation();

  Date.prototype.addHours= function(h) {
    this.setHours(this.getHours()+h);
    return this;
  }

  var date = new Date();
  var i = date.getMinutes();
  var h = date.getHours();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();

  $scope.uiConfig = {
    calendar:{
      editable: true,
      firstDay: 1,
      header:{
        left: 'prevYear,prev',
        center: 'title',
        right: 'next,nextYear'
      },
      weekNumbers: true,
      draggable: false,
      dayClick: function(date, jsEvent, view) {
        $scope.showAddBt  = true;
        $scope.cal = {};
        $scope.cal.allDay = true;
        $scope.cal.start = date; 
        $scope.cal.end = date; 
        $('#calendar-item').foundation('reveal', 'open');
        console.log('DayClick date -> ' + date); 
      },
      eventClick: function(calEvent, jsEvent, view) {
        $scope.showAddBt  = false;
        $scope.cal = {};
        $scope.cal.id     = calEvent.id;
        $scope.cal.title  = calEvent.title;
        $scope.cal.allDay = calEvent.allDay;
        $scope.cal.start  = calEvent.start; 
        $scope.cal.end    = calEvent.end; 
        $('#calendar-item').foundation('reveal', 'open');
        console.log('EventClick date -> ' + date); 
      }
    }
  };

  $scope.changeView = function(view) {
    $('#myCalendar').fullCalendar('changeView', view);
  };

  $scope.gotoToday = function() {
    $('#myCalendar').fullCalendar('today');
  };

  $scope.setEnd = function(cal) {
    if ($scope.cal.start >= $scope.cal.end) {
      $scope.cal.end = cal.start.addHours(1); 
    }
  };

  $scope.allDayChange = function(cal) {

    //console.log('AlldayChange getHours' + cal.start.getHours());
    //if(cal.start.getHours() === 0) {
    //  cal.start.addHours(12);
    //  $scope.cal.start = cal.start; 
    //}

    if (Object.prototype.toString.call(cal.end) !== '[object Date]') {
      $scope.cal.end = cal.start.addHours(1); 
    }

  };

  $scope.events = [
      {id: 1, title: 'All Day Event',start: new Date(y, m, 1)},
      {id: 2, title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
      {id: 9, title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
      {id: 9, title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
      {id: 8, title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
      {id: 4, title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
    ];

  $scope.addEvent = function addEvent(cal) {
    $('a.close-reveal-modal').trigger('click');
    if (cal.title !== undefined) {
      console.log('addEvent: ' + cal.title); 
      console.log('addEvent start: ' + cal.start); 
      console.log('addEvent end: ' + cal.end); 
      console.log('addEvent allDay: ' + cal.allDay); 
      cal.id = new Date ();
      $scope.events.push({
        id: cal.id,
        title: cal.title,
        start: cal.start,
        end: cal.end,
        allDay: cal.allDay
      });
    }
  }

  $scope.updateEvent = function updateEvent(cal) {
    $('a.close-reveal-modal').trigger('click');
    if (cal.title !== undefined) {
      console.log('addEvent: ' + cal.title); 
      console.log('addEvent start: ' + cal.start); 
      console.log('addEvent end: ' + cal.end); 
      console.log('addEvent allDay: ' + cal.allDay); 
      cal.id = new Date ();
      $scope.events.indexpush({
        id: cal.id,
        title: cal.title,
        start: cal.start,
        end: cal.end,
        allDay: cal.allDay
      });
    }
  }

  $scope.cancelEvent = function cancelEvent() {
    $('a.close-reveal-modal').trigger('click');
    console.log('##### test -> close'); 
  }

  $scope.eventSources = [$scope.events];

}]);

appControllers.controller('BookmarkController', ['$scope', function($scope) {
  $scope.greeting = 'Bookmark controller....';
  $scope.bookmarks = ["bookmark 1","bookmark 2","bookmark 3","bookmark 4"];
}]);

appControllers.controller('PostListController', ['$rootScope', '$scope', '$state', '$window', 'flash', 'PostService', 
  function PostListController($rootScope, $scope, $state, $window, flash, PostService) {

    $(document).foundation();

    // Save general post settings
    $scope.saveSettings = function saveSettings() {
      $('a.close-reveal-modal').trigger('click');
      flash('success', 'Settings saved');
      $state.go('post', {}, {reload: true});
    }

    // Set post limit for all posts
    $scope.postLimit =  $window.localStorage.postLimit;
    $scope.changeLimit = function(limit) {
      $window.localStorage.postLimit =  limit;
    };

    $scope.searchForm = false;  // Hide searchFrom, toggle first.
    $scope.toggleSearch = function () {
      $scope.searchForm = !$scope.searchForm;
      $scope.searchKey =  $window.sessionStorage.postSearchKey;
    };

    $scope.posts = [];

    PostService.findAll($window.localStorage.postLimit).success(function(data) {
      $scope.posts = data;
      $window.localStorage.postsAll = JSON.stringify(data);
    }).error(function(data, status) {
      console.log('Status: ' + status);
      flash('alert', 'Error finding posts');
      if(status === 0) {
        flash('alert', 'Working offline');
        if($window.localStorage.getItem('postsAll') !== null) {
          console.log('postsAll from localstorage');
          $scope.posts = JSON.parse($window.localStorage.postsAll);
        }
      }
    });

    $scope.$watch('searchKey', function(searchKey) {
        if (searchKey !== undefined && searchKey.length >= 3) {
          $window.sessionStorage.postSearchKey = searchKey;
          PostService.searchAll(searchKey).success(function(data) {
            $scope.posts = data;
          }).error(function(data, status) {
            console.log(status);
            console.log('Posts search error');
            if(status === 0) {
              console.log('Posts search notting found');
            } 
          }); 
        }
    });

    $scope.updatePublicState = function updatePublicState(post, makePublic) {
      if (post !== undefined && makePublic !== undefined) {

        PostService.changePublicState(post._id, makePublic).success(function(data) {
          var posts = $scope.posts;
          for (var postKey in posts) {
            if (posts[postKey]._id == post._id) {
              $scope.posts[postKey].public = makePublic;
              break;
            }
          }
        }).error(function(status, data) {
          console.log(status);
          console.log(data);
        });
      }
    };
  }
]);

appControllers.controller('PostController', ['$rootScope', '$scope', '$state' ,'$window', '$stateParams', 'flash', 'PostService', 
  function PostController($rootScope, $scope, $state, $window, $stateParams, flash, PostService) {

    $(document).foundation();

    $scope.saveForm = false; // Hide save icon, $scope.change first.
    $scope.toggleForm = function () {
      $scope.editForm = !$scope.editForm;
    };

    // Show save icon
    $scope.change = function() {
      $scope.saveForm = true;
    };

    $scope.post = {};
    var id = $stateParams.id;

    if ($stateParams.id.length > 23) {
      PostService.read(id).success(function(data) {
        $scope.post = data;
        $scope.toc = processToc(data);
        $window.localStorage['post_' + id] = JSON.stringify(data);
      }).error(function(data, status) {
        flash('alert', 'Post read failure');
        console.log('Status: ' + status);
        if(status === 0 && $window.localStorage.getItem('post_' + id) !== null) {
          flash('alert', 'Read only - Working offline');
          $scope.post = JSON.parse($window.localStorage['post_' + id]);
          console.log('Post from localstorage id: ' + id);
        } else {
          flash('alert', 'This post is not offline!');
          console.log('No post from localstorage id: ' + id);
        }
      });
    }

    // Hide editFrom, toggle first.
    if ($stateParams.id === "create") {
      $scope.editForm = true;
    }

    $scope.save = function save(post) {

      if($("#post-settings").is(":visible")) {
        $('a.close-reveal-modal').trigger('click');
      }

      if (post !== undefined && post.title !== undefined && post.title !== "") {

        // String comma separated to array
        if (post.tags !== undefined && Object.prototype.toString.call(post.tags) !== '[object Array]') {
          post.tags = post.tags.split(',');
        }
        if (post._id !== undefined) {
          PostService.update(post).success(function(data) {
            $state.go("post");
            flash('success', 'Post update successful');
          }).error(function(status, data) {
            flash('alert', 'Post update failure');
            $state.go("login");
          });
        } else {
          PostService.create(post).success(function(data) {
             flash('success', 'Post create successful');
             $state.go("post");
          }).error(function(status, data) {
            if(status === 0) {
              $rootScope.online = false;
            }
            flash('alert', 'Post create failure');
          });
        }
      }
    };

    $scope.deletePost = function deletePost(post) {
      if (id !== undefined) {
        $('a.close-reveal-modal').trigger('click');
        PostService.delete(id).success(function(data) {
          console.log('Deleted post:' + post._id); 
          flash('success', 'Post deleted successful');
          $state.go("post");
        });
      }
    };

    function processToc(data) {

      // Inspiration from Eugene Datsky
      // https://raw.githubusercontent.com/princed/table-of-contents-preprocessor/master/toc.js

      var indents = [""];
      for(var i = 1; i < 10; i++) {
          indents.push(indents[i-1] + " ");
      }

      if (data.content !== undefined) {

        var lines = data.content.trimRight().split('\n');
        var titles = [];
        var toc = [];
        var depths = [];
        var minDepth = 1000000;

        for(var i = 0; i < lines.length; i++) {
          var line = lines[i];
          var m = line.match(/^(#+)(.*)$/);
          if (!m) continue;
          minDepth = Math.min(minDepth, m[1].length);
          depths.push(m[1].length);

          title = m[2];
          uri = title.trim().toLowerCase().replace(/[\s-]/g, '').replace(/[^-0-9a-z]/g, '');

          titles.push({title: title, uri: uri}).trim;
        }

        // Show TOC if we have more then 3 titles.
        if (titles.length > 3) {
          $scope.showToc = true;
        } else {
          $scope.showToc = false;
        }

        for(var i = 0; i < depths.length; i++) {
          depths[i] -= minDepth;
        }

        for(var i = 0; i < depths.length; i++) {
          toc.push(indents[depths[i]] + "- [" + titles[i].title + "](/#/post/" + id + "#" + titles[i].uri + ")");
        }
        return toc.join('\n');

      }
    }

  }
]);

appControllers.controller('UserController', ['$scope', '$state', '$window', 'flash', 'UserService', 'AuthenticationService',
  function UserController($scope, $state, $window, flash, UserService, AuthenticationService) {

    $scope.signIn = function signIn(username, password) {
      if (username !== null && password !== null) {

        UserService.signIn(username, password).success(function(data) {
            AuthenticationService.isAuthenticated = true;
            // We choose localStorage i.o. sessionStorage so that 
            // we keep content after clossing the browser.
            flash('succes', 'Signed in');
            $window.localStorage.token = data.token;
            $state.go('home');
        }).error(function(status, data) {
          if(status === 0 && status === null) {
            flash('alert', 'Not online');
          }
          else {
            flash('alert', 'Wrong credentials');
          }
          console.log("Signin status: " + status);
        });
      }
    };

    $scope.logOut = function logOut() {
      AuthenticationService.isAuthenticated = false;
      // We have logout so we delete localstore for security.
      flash('success', 'Logged out and deleted local information');
      $window.localStorage.clear();
      $state.go('home');
      console.log('UserController -> logOut');
    };

    $scope.register = function register(username, password, passwordConfirm) {
      console.log('UserController -> register');
      if (AuthenticationService.isAuthenticated) {
        console.log('Register -> Already logged in!'); 
        flash('alert', 'Already logged in!');
      }
      else {
        UserService.register(username, password, passwordConfirm).success(function(data) {
          console.log('UserController -> register success');
          flash('success', 'Succesfull registered as new a user');
        }).error(function(status, data) {
          flash('alert', 'Something went wrong');
          console.log("Signin status: " + status);
          console.log(data);
        });
      }
      $state.go('home');
    };
  }
]);

