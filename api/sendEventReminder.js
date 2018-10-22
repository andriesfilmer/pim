var nodemailer = require('nodemailer');
var config = require('./config/config.js');

// This script is only for Event reminders.
//-----------------------------------------
// I have a cron that runs each 5 minutes.
// */5 * * * * export NODE_ENV=production /usr/local/bin/node /path/to/api_root/sendEventReminder.js

// Get events from db.
getEvents();

function getEvents(mStart, mEnd) {

  config.pool.getConnection(function(err, connection) {

    var sql = 'SELECT * FROM events\
              WHERE start >= NOW() + INTERVAL 1 DAY\
              AND start <= NOW() + INTERVAL 1 DAY + INTERVAL 5 MINUTE';

    var query = connection.query(sql, [mStart, mEnd], function(err, results) {

      connection.release();

      if (err) throw err;

      results.forEach(function(event){

        // Debugging
        //console.log(event.title);
        //console.log("Start: " + event.start);
        //console.log("End  : " + event.end);

        getUser(event);

      });
    });
  });
};

// Get user email address
function getUser(event) {

  config.pool.getConnection(function(err, connection) {

    var sql = 'SELECT name, email FROM user WHERE id = ? AND active=1';

    var query = connection.query(sql, [event.user_id], function(err, results) {

      connection.release();

      if (err) throw err;

      // Call for sending the reminder.
      user = results[0];
      sendReminder(event, user);

    });
  });
}

// Function for sending the email reminder.
function sendReminder(event,user) {

  var emailAddress = user.name + ' <' + user.email + '>' ;
  var transporter = nodemailer.createTransport({
    port: config.env().mail_port,
    ignoreTLS: true
  });

  // Debugging
  //console.log('Send reminder to: ' + emailAddress);
  //console.log('From address: ' + config.env().mail_from);

  var description = '';
  if (event.description) {
    description = event.description;
  }

  transporter.sendMail({
      from: config.env().mail_from,
      to: emailAddress,
      subject: event.title,
      text: 'Title: ' + event.title + '\n'
        + 'Start: ' + event.start + '\n'
        + 'End  : ' + event.end + '\n'
        + '---------------------------------------------------------------\n\n'
        + description + '\n\n'
        + '---------------------------------------------------------------\n'
        + 'Event created on: ' + event.created + '\n'
        + '---------------------------------------------------------------\n'
  });
}

setTimeout(function onEnd() {
  process.exit(0);
}, 1000);


