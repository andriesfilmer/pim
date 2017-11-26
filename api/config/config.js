var mysql = require('mysql');

var env = require('./env.json');
var secret = require('./secret.js');

// Take a look in `env.json` form enviroment vars.
exports.env = function() {
  var node_env = process.env.NODE_ENV || 'development';
  //console.log("env:" + node_env)
  return env[node_env];
};

var pool = mysql.createPool({
  //debug    : true,
  host     : exports.env().mysql_host,
  user     : exports.env().mysql_user,
  password : secret.mysqlpassword,
  database : 'pim',
  //stringifyObjects : false,
  dateStrings: 'date'

});

exports.pool = pool;

// Time in minutes (10080 = week, 524160 = 52 weeks)
exports.expireToken = '524160m';

