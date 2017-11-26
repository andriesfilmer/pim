var nodemailer = require('nodemailer');
var moment = require('moment');

var config = require('./config/config.js');

// This script is only for reminder off birthdays.
//------------------------------------------------
// For the crontab that runs once each day at 5am.
// 0 5 * * * export NODE_ENV=production /usr/bin/node /path/to/api_root/sendBirthDayReminder.js


// Iterate contacts from db.
getBirthdays();

function getBirthdays() {

  config.pool.getConnection(function(err, connection) {

    var sql = "SELECT * FROM contacts\
               WHERE DATE_FORMAT(birthdate,'%m-%d') = DATE_FORMAT(NOW() + INTERVAL 1 DAY, '%m-%d')";

    var query = connection.query(sql, function(err, results) {

      connection.release();

      if (err) throw err;

      results.forEach(function(contact){

        // Call for recipient
        getUser(contact);

      });
    });
  });
};

// Get user email address
function getUser(contact) {

  config.pool.getConnection(function(err, connection) {

    var sql = 'SELECT name,email FROM user WHERE id = ? AND active=1 LIMIT 1';

    var query = connection.query(sql, [contact.user_id], function(err, results) {

      connection.release();

      if (err) throw err;

      // Call for sending the reminder.
      user = results[0];
      sendReminder(contact, user);

    });
  });
}

// Function for sending the email reminder.
function sendReminder(contact,user) {

  var emailAddress = user.name + ' <' + user.email + '>' ;
  //console.log('Send reminder for: ' + contact.name);
  //console.log('Send reminder to: ' + emailAddress);
  //console.log('Send reminder from: ' + config.env().mail_from);
  //console.log('Send reminder port: ' + config.env().mail_port);

  var transporter = nodemailer.createTransport({
    port: config.env().mail_port,
    ignoreTLS: true
  });

  transporter.sendMail({
      from: config.env().mail_from,
      to: emailAddress,
      subject: 'Birthday reminder for: ' + contact.name,
      text: 'Birthday: ' + moment(contact.birthdate).format('YYYY-MM-DD') + '\n\n'
          + contact.name + ' is getting ' + (moment().diff(contact.birthdate, 'years') + 1) + ' within one day.\n'
  });
}

setTimeout(function() {
  process.exit(0);
}, 1000);

