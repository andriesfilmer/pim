var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');

var config = require('../config/config.js');
var secret = require('../config/secret.js');

exports.signin = function(req, res) {

  var email = req.body.email || undefined;
  var password = req.body.password || undefined;

  if (email === undefined || password === undefined) { 
    return res.sendStatus(401); // Unauthorized
  }

  config.pool.getConnection(function(err, connection) {

    var sql = 'SELECT * FROM user WHERE email = ? AND password = ? AND active=1';

    connection.query(sql, [email, password], function(err, results) {

      connection.release();

      if (err) throw err;

      console.log('Results: ', results);

      if (results.length === 0) {

        return res.sendStatus(401); // Unauthorized 

      } else {

        console.log("####### id: " + results[0].id);
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

    return res.status(401).end(); // Unauthorized

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
        sendMailToken(results[0].name, results[0].email, token);
        return res.end(JSON.stringify({ success: true, message: 'E-mail is verstuurd!' }));

      } else {

        return res.end(JSON.stringify({ success: false, message: 'E-mailadres onbekend!' }));

      }

    });

  });

  // Function for sending a login/change-password token to emailaddress.
  function sendMailToken(name, email, token) {

    var transporter = nodemailer.createTransport({ 
      port: config.env().mail_port,
      ignoreTLS: true
    });

    var emailAddress = name + ' <' + email + '>' ; 
    //console.log('Send token to: ' + emailAddress + ' Port: ' + config.env().mail_port); 

    transporter.sendMail({
        from: config.env().mail_from,
        to: emailAddress,
        subject: 'Inholland-Face | wachtwoord vergeten',
        text: 'Beste ' + name + ',\n\n'
          + 'Iemand heeft een verzoek gestuurd om je wachtwoord te resetten (waarschijnlijk jij zelf).\n\n'
          + 'Klik op de onderstaande link en verander je wachtwoord:\n'
          + config.env().cors_url + '/#/user/change-password?token=' + token + '\n\n'
          + 'Als het niet de bedoeling was om je wachtwoord te resetten dan kan je deze mail negeren; Je wachtwoord wordt niet aangepast.\n\n'
          + 'Groet Andries Filmer.\n'
          + 'http://andries.filmer.nl\n'

    });

  }
}

exports.passwordChange = function(req, res) {


  if (!req.user) {
    return res.sendStatus(401); // Not authorized
  }

  console.log('passwordChange for id: ' + req.user.id);

  //var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
  var passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");
  //console.log('##### password -> ' + req.body.password); 
  if (!passwordRegex.test(req.body.password)){
    return res.end(JSON.stringify({ success: false, message: 'Wachtwoord moet minstens 8 karakters zijn met cijfers, hoofd- en kleineletters.' }));
  }

  if (req.body.passwordConfirmation !== req.body.password) {
    return res.end(JSON.stringify({ success: false, message: 'Wachtwoorden zijn niet gelijk!' }));
  }

  // Have te make a password strength check.
  config.pool.getConnection(function(err, connection) {

    var sql = 'UPDATE user SET password = ? WHERE id = ?';
    connection.query(sql, [req.body.password, req.user.id], function(err, result) {

      connection.release();

      if (err) throw err;

      if (result.affectedRows > 0) {

        return res.end(JSON.stringify({ success: true, message: 'Wachtwoord is aangepast.' }));

      } else {

        return res.end(JSON.stringify({ success: false, message: 'Gebruiker niet gevonden!' }));

      }

    });

  });

}

