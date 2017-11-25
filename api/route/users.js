var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');

var config = require('../config/config.js');
var secret = require('../config/secret.js');

exports.signin = function(req, res) {

  var email = req.body.email || undefined;
  var password = req.body.password || undefined;

  if (!email || !password) { 
    return res.status(401).send('Unauthorized').end();
  }

  config.pool.getConnection(function(err, connection) {

    var sql = 'SELECT * FROM user WHERE email = ? AND password = ? AND active=1';

    var query = connection.query(sql, [email, password], function(err, results) {

      connection.release();

      if (err) throw err;

      if (results.length === 0) {

        return res.sendStatus(401); // Unauthorized 

      } else {

        console.log("######## Login: " + new Date().toUTCString() + " User: " + results[0].name);
        var token = jwt.sign({id: results[0].id}, secret.secretToken, { expiresIn: config.expireToken });
        return res.json({token:token, user_id: results[0].id, fullname: results[0].name});

      }
    });
  });
}

exports.logout = function(req, res) {

  // Angular has already destroyed the sessionStorage.token
  //console.log("Logout -> no user from angular yet! " + req.user);

  if (req.user) {
    delete req.user;
    return res.send(200); // OK
  } else {
    return res.status(401).send('Unauthorized').end();
  }
}

exports.sendToken = function(req, res) {

  config.pool.getConnection(function(err, connection) {

    var sql = 'SELECT * FROM user WHERE email = ? and active=1';
    connection.query(sql, [req.body.email], function(err, results) {

      connection.release();

      if (err) throw err;

      console.log('Results: ', results);

      if (results.length > 0 ) {

        var token = jwt.sign({id: results[0].id}, secret.secretToken, { expiresIn: '1200m' });
        sendMailToken(results[0], token);

        return res.status(200).send('E-mail is send').end();

      } else {

        return res.status(200).send('E-mail unknown').end();

      }
    });
  });

  // Function for sending a login/change-password token to emailaddress.
  function sendMailToken(user, token) {

    var transporter = nodemailer.createTransport({ 
      port: config.env().mail_port,
      ignoreTLS: true
    });

    var emailAddress = user.name + ' <' + user.email + '>' ; 
    //console.log('Send token to: ' + emailAddress + ' Port: ' + config.env().mail_port); 

    transporter.sendMail({
        from: config.env().mail_from,
        to: emailAddress,
        subject: 'PIM token to change password',
        text: 'Hello ' + user.name + ',\n\n'
          + 'Someone has requested a token to reset your password (probably you).\n\n'
          + 'Just click on this link and change your password:\n'
          + config.env().cors_url + '/#/user/change-password/' + token + '/' + user.id + '\n\n'

          + 'If you didn\'t mean to reset your password, then you can just ignore this email; your password will not change.\n\n'
          + 'Regards Andries Filmer.\n'
          + 'http://pim.filmer.net\n'

    });
  }
}

exports.passwordChange = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  var passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");
  if (!passwordRegex.test(req.body.password)) {
    return res.status(400).json('Password must be at least 8 characters and with numbers and upper- and lowercase.').end(); // Bad request
  }

  if (req.body.passwordConfirmation !== req.body.password) {
    return res.status(400).json('Passwords are not equal').end(); // Bad request
  }

  // Have te make a password strength check.
  config.pool.getConnection(function(err, connection) {

    var sql = 'UPDATE user SET password = ? WHERE id = ?';

    var query = connection.query(sql, [req.body.password, req.user.id], function(err, result) {

      connection.release();

      if (err) throw err;

      //if (result.changedRows > 0) {
      //  return res.status(200).json('Password changed successfully').end();
      //} else {
      //  return res.status(200).json('Password not changed!').end();
      //}
      console.log("######## Password change: " + new Date().toUTCString() + " user.id: " + req.user.id);
      var token = jwt.sign({id: req.user.id}, secret.secretToken, { expiresIn: config.expireToken });
      return res.json({ token:token, user_id: req.user.id }).end();

    });
  });
}

