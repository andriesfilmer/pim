(function() {
'use strict';

angular.module('ngCropper', [])
.directive('ngCropper', ['$q', '$parse', function($q, $parse) {
  return {
    restrict: 'A',
    scope: {
      options: '=ngCropperOptions',
      showEvent: '=ngCropperShow'
    },
    link: function(scope, element, atts) {
      preprocess(scope.options, element[0])
      .then(function(options) {
         element.cropper(options);
      })
    }
  };

  function preprocess(options, img) {
    options = options || {};
    var result = $q.when(options);
    return result;
  }

}])
.service('Cropper', ['$q', function($q) {

  this.encode = function(blob) {
    var defer = $q.defer();
    var reader = new FileReader();
    reader.onload = function(e) {
      defer.resolve(e.target.result);
    };
    reader.readAsDataURL(blob);
    return defer.promise;
  };

  this.decode = function(dataUrl) {
    var meta = dataUrl.split(';')[0];
    var type = meta.split(':')[1];
    var binary = atob(dataUrl.split(',')[1]);
    var array = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], {type: type});
  };

  this.crop = function(file, data) {
    var _decodeBlob = this.decode;
    return this.encode(file).then(_createImage).then(function(image) {
      var canvas = createCanvas(data);
      var context = canvas.getContext('2d');
      context.drawImage(image, data.x, data.y, data.width, data.height, 0, 0, data.width, data.height);

      var encoded = canvas.toDataURL(file.type);
      removeElement(canvas);

      return _decodeBlob(encoded);
    });
  };

  this.scale = function(file, data) {
    var _decodeBlob = this.decode;
    return this.encode(file).then(_createImage).then(function(image) {
      var heightOrig = image.height;
      var widthOrig = image.width;
      var ratio, height, width;

      if (angular.isNumber(data)) {
        ratio = data;
        height = heightOrig * ratio;
        width = widthOrig * ratio;
      }

      if (angular.isObject(data)) {
        ratio = widthOrig / heightOrig;
        height = data.height;
        width = data.width;

        if (height && !width)
          width = height * ratio;
        else if (width && !height)
          height = width / ratio;
      }

      var canvas = createCanvas(data);
      var context = canvas.getContext('2d');

      canvas.height = height;
      canvas.width = width;

      context.drawImage(image, 0, 0, widthOrig, heightOrig, 0, 0, width, height);

      var encoded = canvas.toDataURL(file.type);
      removeElement(canvas);

      return _decodeBlob(encoded);
    });
  };

  function _createImage(source) {
    var defer = $q.defer();
    var image = new Image();
    image.onload = function(e) { defer.resolve(e.target); };
    image.src = source;
    return defer.promise;
  }

  function createCanvas(data) {
    var canvas = document.createElement('canvas');
    canvas.width = data.width;
    canvas.height = data.height;
    canvas.style.display = 'none';
    document.body.appendChild(canvas);
    return canvas;
  }

  function removeElement(el) {
    el.parentElement.removeChild(el);
  }

}]);

})();
