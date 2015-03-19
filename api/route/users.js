var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');

var db = require('../config/mongo_database');
var config = require('../config/config.js');
var config = config.env();
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
    err = { message: 'Validation failed', name: 'ValidationError', errors: { 
              password: { 
                message: 'Password and confirm password not equal.',
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
      return res.send(err); // Internal Server Error
    }
    return res.sendStatus(200); // Success
  });

}

exports.passwordChange = function(req, res) {

  if (!req.user) {
    return res.sendStatus(401); // Not authorized
  }

  if (req.body.passwordConfirmation !== req.body.password) {
    console.log('PasswordConfirmation not equal with password'); 
    err = { errors: { password: { message: 'Password and confirm password not equal.'} } }
    return res.send(err);
  }

  var user = {};
  db.userModel.findOne({_id: req.user.id}, function (err, user) {

    user.password = req.body.password;
    user.save(function(err) {
      console.log('Change password user.save -> ' + user.password);
      if (err) {
        console.log('Error user.save.');
        return res.send(err); // Internal Server Error
      }
      return res.sendStatus(200); // Success
    });

  });

}

exports.sendToken = function(req, res) {

  console.log('##### body email -> ' + req.body.email); 

  var user = {};
  db.userModel.findOne({email: req.body.email}, function (err, user) {

    if (user) {
      var token = jwt.sign({id: user._id}, secret.secretToken, { expiresInMinutes: 60 });
      console.log('##### token -> ' + token); 
      sendMailToken(user.fullname, user.email, token);
      return res.sendStatus(200); // Success
    }
    else {
      err = { error: { message: 'Emailaddress unknown' } }
      return res.send(err);
    }

  });

  // Function for sending a login/change-password token to emailaddress.
  function sendMailToken(fullname, email, token) {

    var transporter = nodemailer.createTransport({ 
      port: config.mail_port,
      ignoreTLS: true
    });

    var emailAddress = fullname + ' <' + email + '>' ; 
    console.log('Send token to: ' + emailAddress + ' Port: ' + config.mail_port); 

    transporter.sendMail({
        from: config.mail_from,
        to: emailAddress,
        subject: 'PIM token to change password',
        text: 'Hello ' + fullname + ',\n\n'
          + 'Someone has requested a token to reset your password (probably you).\n\n'
          + 'Just click on this link and change your password:\n'
          + config.cors_url + '/#/user/change-password?token=' + token + '\n\n'
          + 'If you didn\'t mean to reset your password, then you can just ignore this email; your password will not change.\n\n'
          + 'Regards Andries Filmer.\n'
          + 'http://pim.filmer.nl\n'

    });

  }

}
