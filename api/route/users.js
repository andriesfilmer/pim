var jwt = require('jsonwebtoken');

var db = require('../config/mongo_database');
var config = require('../config/config.js');
var secret = require('../config/secret');


exports.signin = function(req, res) {
  var username = req.body.username || '';
  var password = req.body.password || '';
  console.log('users -> signin -> username:' + username);

  if (username == '' || password == '') { 
    return res.send(401); // Unauthorized
  }

  db.userModel.findOne({username: username}, function (err, user) {

    if (err) {
      console.log('users -> signin err:' + username);
      console.log(err);
      return res.send(401);
    }

    if (user == undefined) {
      console.log('users -> signin -> undefined user');
      return res.send(401); // Unauthorized 
    }

    user.comparePassword(password, function(isMatch) {
      console.log('users -> signin compare password: ' + password);
      if (!isMatch) {
        console.log("users -> password mismatch " + user.username);
        return res.send(401); // Unauthorized
       }

      var token = jwt.sign({id: user._id}, secret.secretToken, { expiresInMinutes: config.expireToken });
      console.log('users -> Logged in with user id:' + user._id + ' Token expires: ' + config.expireToken );
      return res.json({token:token});
    });

  });
};

exports.logout = function(req, res) {

  // Angular has already destroyed the sessionStorage.token
  // So do we need this?
  console.log("Logout -> no user from angular yet! " + req.user);
  console.log('##### test logout -> ' + req.body.username); 
  if (req.user) {
    delete req.user;  
    return res.send(200); // OK
  }
  else {
    return res.status(401).end(); // Unauthorized
  }
}

exports.register = function(req, res) {
  var username = req.body.username || '';
  var password = req.body.password || '';
  var passwordConfirmation = req.body.passwordConfirmation || '';

  console.log("Register " + req.username);
  if (username == '' || password == '' || password != passwordConfirmation) {
    return res.send(400); // Bad Request
  }

  var user = new db.userModel();
  user.username = username;
  user.password = password;

  user.save(function(err) {
    console.log('user.save -> ' + username);

    if (err) {
      console.log(err);
      console.log('Error user.save.');
      return res.send(500); // Internal Server Error
    }

  });
}
