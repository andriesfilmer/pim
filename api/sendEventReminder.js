var nodemailer = require('nodemailer');
var moment = require('moment');

var config = require('./config/config.js');
var secret = require('./config/secret');

// This script is only for Event reminders.
//-----------------------------------------
// I have a cron that runs each 5 minutes.
// */5 * * * * export NODE_ENV=production /usr/bin/node /path/to/api_root/sendEventReminder.js
var mStart = moment().add(1, 'days').format('YYYY-MM-DD HH:mm');
var mEnd   = moment().add(1, 'days').add(5, 'minutes').format('YYYY-MM-DD HH:mm');

// Debugging
//console.log('Between -> gte: ' + mStart + ' And -> lt: ' + mEnd); 

// Get events from MongoDb.
getEvents(mStart, mEnd);

function getEvents(mStart, mEnd) {

  config.pool.getConnection(function(err, connection) {

    var sql = 'SELECT id as _id, user_id,title, start, end, allDay, tz, className \
               FROM events WHERE start >= ? AND start <= ? LIMIT 10';

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

    var sql = 'SELECT * FROM user WHERE id = ? AND active=1';

    var query = connection.query(sql, [event.user_id], function(err, result) {

      connection.release();

      if (err) throw err;

      // Call for sending the reminder.
       sendReminder(event, result);

    });
  });
}

// Function for sending the email reminder.
function sendReminder(event,user) {

  var emailAddress = user[0].name + ' <' + user[0].email + '>' ; 
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
        + 'Start: ' + moment(event.start).format('YYYY-MM-DD HH:mm') + '\n'
        + 'End  : ' + moment(event.end).format('YYYY-MM-DD HH:mm') + '\n'
        + '---------------------------------------------------------------\n\n'
        + description + '\n\n'
        + '---------------------------------------------------------------\n'
        + 'Event created on: ' + moment(event.created).format('YYYY-MM-DD') + '\n'
        + '---------------------------------------------------------------\n'
  });

}

setTimeout(function onEnd() {
  process.exit(0);
}, 1000);

