appControllers.controller('PostListCtrl', ['$scope', '$sce', 'PostService',
  function PostListCtrl($scope, $sce, PostService) {

    $scope.posts = [];

    PostService.findAllPublished().success(function(data) {
      for (var postKey in data) {
        data[postKey].content = $sce.trustAsHtml(data[postKey].content);
      }

      $scope.posts = data;
    }).error(function(data, status) {
      console.log(status);
      console.log(data);
    });
  }
]);

//appControllers.controller('PostViewCtrl', ['$scope', '$routeParams', '$location', '$sce', 'PostService',
//    function PostViewCtrl($scope, $routeParams, $location, $sce, PostService) {
//
//        $scope.post = {};
//        var id = $routeParams.id;
//
//        PostService.read(id).success(function(data) {
//            //data.content = $sce.trustAsHtml(data.content);
//            data.content.htmlSafe = $sce.trustAsHtml(data.content);
//            $scope.post = data;
//        }).error(function(data, status) {
//            console.log(status);
//            console.log(data);
//        });
//
//    }
//]);


appControllers.controller('AdminPostListCtrl', ['$scope', 'PostService', 
    function AdminPostListCtrl($scope, PostService) {
        $scope.posts = [];

        PostService.findAll().success(function(data) {
            $scope.posts = data;
        });

        $scope.updatePublishState = function updatePublishState(post, shouldPublish) {
            if (post != undefined && shouldPublish != undefined) {

                PostService.changePublishState(post._id, shouldPublish).success(function(data) {
                    var posts = $scope.posts;
                    for (var postKey in posts) {
                        if (posts[postKey]._id == post._id) {
                            $scope.posts[postKey].is_published = shouldPublish;
                            break;
                        }
                    }
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }


        $scope.deletePost = function deletePost(id) {
            if (id != undefined) {

                PostService.delete(id).success(function(data) {
                    var posts = $scope.posts;
                    for (var postKey in posts) {
                        if (posts[postKey]._id == id) {
                            $scope.posts.splice(postKey, 1);
                            break;
                        }
                    }
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }
    }
]);

appControllers.controller('AdminPostCreateCtrl', ['$scope', '$location', 'PostService',
    function AdminPostCreateCtrl($scope, $location, PostService) {

        $scope.save = function save(post, shouldPublish) {
            if (post != undefined 
                && post.title != undefined
                && post.tags != undefined) {

                var content = $('#textareaContent').val();
                if (content != undefined) {
                    post.content = content;

                    if (shouldPublish != undefined && shouldPublish == true) {
                        post.is_published = true;
                    } else {
                        post.is_published = false;
                    }

                    PostService.create(post).success(function(data) {
                        $location.path("/admin");
                    }).error(function(status, data) {
                        console.log(status);
                        console.log(data);
                    });
                }
            }
        }
    }
]);

appControllers.controller('AdminPostEditCtrl', ['$scope', '$routeParams', '$location', '$sce', 'PostService',
  function AdminPostEditCtrl($scope, $routeParams, $location, $sce, PostService) {

    $scope.editForm = true;  // Hide editFrom on toggle first
    $scope.saveForm = false; // Show save icon
    $scope.toggleForm = function () {
      $scope.editForm = !$scope.editForm;
      if ($scope.dbTitle !== $('#inputTitle').val() ||
          $scope.dbContent.toString() !== $('#textareaContent').val() ||
          $scope.dbTags.toString() !== $('#inputTags').val()) {
        $scope.saveForm = true;
      }
    };

    $scope.post = {};
    var id = $routeParams.id;

    PostService.read(id).success(function(data) {
      $scope.post = data;

      // Set db values so we can check if its changed.
      //
      $scope.dbTitle   = data.title;
      $scope.dbContent = $sce.trustAsHtml(data.content);
      $scope.dbTags    = data.tags;

      $('#inputTitle').val($scope.dbTitle);
      $('#textareaContent').val($scope.dbContent);
      $('#inputTags').val($scope.dbTags);

    }).error(function(status, data) {
      console.log('Post read failure!'); 
      $location.path("/admin");
    });

    $scope.save = function save(post, shouldPublish) {
      if (post !== undefined && post.title !== undefined && post.title != "") {

        var content = $('#textareaContent').val();
        if (content !== undefined && content != "") {
          post.content = content;
        }

        // String comma separated to array
        if (Object.prototype.toString.call(post.tags) !== '[object Array]') {
          post.tags = post.tags.split(',');
          //post.tags = $('#inputTags').val().split(',');
        }

        PostService.update(post).success(function(data) {
          console.log('Post updated success.'); 
          $location.path("/admin/post");
        }).error(function(status, data) {
           console.log(status);
           console.log(data);
        });
      }
    }
  }
]);

appControllers.controller('AdminUserCtrl', ['$scope', '$location', '$window', 'UserService', 'AuthenticationService',  
    function AdminUserCtrl($scope, $location, $window, UserService, AuthenticationService) {
        console.log('AdminUserCtrl');

        //Admin User Controller (signIn, logOut)
        $scope.signIn = function signIn(username, password) {
            console.log('AdminUserCtrl: Signin');
            if (username != null && password != null) {

                UserService.signIn(username, password).success(function(data) {
                    AuthenticationService.isAuthenticated = true;
                    $window.sessionStorage.token = data.token;
                    $location.path("/admin");
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
        }

        $scope.logOut = function logOut() {
          console.log('AdminUserCtrl -> logOut -> delete sessionStorage.token.');
          AuthenticationService.isAuthenticated = false;
          delete $window.sessionStorage.token;
          $location.path("/");
        }

        $scope.register = function register(username, password, passwordConfirm) {
          console.log('AdminUserCtrl -> register');
          if (AuthenticationService.isAuthenticated) {
            console.log('AdminUserCtrl -> no redirect?');
            $location.path("/admin");
          }
          else {
            UserService.register(username, password, passwordConfirm).success(function(data) {
              console.log('AdminUserCtrl -> register success -> no redirect?');
            }).error(function(status, data) {
              console.log(status);
              console.log(data);
            });
          }
          console.log('AdminUserCtrl -> redirect admin/login');
          $location.path("/admin/login");
        } 
    }
]);


appControllers.controller('PostListTagCtrl', ['$scope', '$routeParams', '$sce', 'PostService',
    function PostListTagCtrl($scope, $routeParams, $sce, PostService) {

        $scope.posts = [];
        var tagName = $routeParams.tagName;

        PostService.findByTag(tagName).success(function(data) {
            for (var postKey in data) {
                data[postKey].content = $sce.trustAsHtml(data[postKey].content);
            }
            $scope.posts = data;
        }).error(function(status, data) {
            console.log(status);
            console.log(data);
        });

    }
]);

