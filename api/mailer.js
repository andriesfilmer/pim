var nodemailer = require('nodemailer');
var moment = require('moment');

var config = require('./config/config.js');
var secret = require('./config/secret');
var db = require('./config/mongo_database');

console.log('Mailer is checking for sending reminders');


// I have a cron that runs each 5 minutes. So the mEnd =+ 5 minutes.
var mStart = moment().add(1, 'days').format("YYYY-MM-DD HH:mm");
var mEnd   = moment().add(1, 'days').add(5, 'minutes').format("YYYY-MM-DD HH:mm");

// Debugging
//console.log('Between -> ' + mStart + ' And -> ' + mEnd); 

// Get events from MongoDb.
getEvents(mStart, mEnd);

function getEvents(mStart, mEnd) {

  var queryEvent = db.eventModel.find({"start": {"$gte": mStart, "$lt": mEnd}});
  queryEvent.select("_id user_id title start end allDay description className created");
  queryEvent.sort('start');
  queryEvent.exec(function(err, results) {
    if (err) {
      console.log(err);
    }

    // If we have a result dan send a reminder for each event.
    if (typeof results === 'object') {

      results.forEach(function(event){

        // Debugging
        //console.log(event.title);
        //console.log("Start: " + event.start);
        //console.log("End  : " + event.end);

        getUser(event);

      });
    }
  });


};

// Get user email address
function getUser(event) {

  var queryUser = db.userModel.find({_id: { $in : [event.user_id]}});
  queryUser.select("_id fullname email");
  queryUser.exec(function(err, result) {

   if (err) {
     console.log(err);
   }

   // Call for sending the reminder.
   sendReminder(event, result);

  });

}

// Function for sending the email reminder.
function sendReminder(event,user) {
 
  var transporter = nodemailer.createTransport({ 
    port: config.mail_port,
    ignoreTLS: true
  });

  var emailAddress = user[0].fullname + ' <' + user[0].email + '>' ; 
  console.log('Send reminder to: ' + emailAddress); 

  var description;
  if (event.description) {
    description = event.description;
  }

  transporter.sendMail({
      from: config.mail_from,
      to: emailAddress,
      subject: 'Reminder: ' + event.title,
      text: 'Start: ' + moment(event.start).format('YYYY-MM-DD HH:mm') + '\n'
        + 'End  : ' + moment(event.end).format('YYYY-MM-DD HH:mm') + '\n\n'
        + description + '\n\n'
        + '------------------------------------------------\n'
        + 'Created: ' + event.created + '\n'
        + '------------------------------------------------\n'
  });

}

setTimeout(function() {
  console.log('Exiting.');
  process.exit(0);
}, 100);

