var jwt = require('jsonwebtoken');

var db = require('../config/mongo_database');
var config = require('../config/config.js');
var secret = require('../config/secret');


exports.signin = function(req, res) {

  var email = req.body.email || '';
  var password = req.body.password || '';

  console.log('users -> signin -> email:' + email);
  console.log('users -> signin -> password:' + password);

  if (email == '' || password == '') { 
    return res.sendStatus(401); // Unauthorized
  }

  db.userModel.findOne({email: email}, function (err, user) {

    if (err) {
      console.log('users -> signin err:' + email);
      console.log(err);
      return res.sendStatus(401);
    }

    if (user == undefined) {
      console.log('users -> signin -> undefined user');
      return res.sendStatus(401); // Unauthorized 
    }

    user.comparePassword(password, function(isMatch) {
      console.log('users -> signin compare password: ' + password);
      if (!isMatch) {
        console.log("users -> password mismatch " + user.email);
        return res.sendStatus(401); // Unauthorized
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
  console.log('##### test logout -> ' + req.body.email); 
  if (req.user) {
    delete req.user;  
    return res.send(200); // OK
  }
  else {
    return res.status(401).end(); // Unauthorized
  }
}

exports.register = function(req, res) {

  if (req.body.passwordConfirmation !== req.body.password) {

    console.log('PasswordConfirmation not equal with password'); 
    err = { message: 'Validation failed',
      name: 'ValidationError',
      errors: 
       { password: 
          { message: 'Password and confirm password not equal.',
            name: 'ValidatorError',
            path: 'password',
            type: 'validation' } } }

    return res.send(err);

  }

  var user = new db.userModel();

  user.fullname = req.body.fullname;
  user.email = req.body.email;
  user.password = req.body.password;

  user.save(function(err) {
    console.log('Registered user.save -> ' + user.email);

    if (err) {
      console.log('Error user.save.');
      console.log(err);
      return res.send(err); // Internal Server Error
    }

    return res.sendStatus(200); // Success

  });
}
