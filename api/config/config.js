// Take a look in `env.json` form enviroment vars.
var env = require('./env.json');

exports.env = function() {
  var node_env = process.env.NODE_ENV || 'development';
  return env[node_env];
};

// Development and productions vars·
// ---------------------------------

// Time in minutes (10080 = week, 524160 = 52 weeks)
exports.expireToken = 524160;

// Default location to store the uploaded photos.
exports.default_upload_photo_dir = '../app/public/upload/contact_photos/';
