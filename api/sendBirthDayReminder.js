var nodemailer = require('nodemailer');
var moment = require('moment');

var config = require('./config/config.js');
var config = config.env();
var secret = require('./config/secret');
var db = require('./config/mongo_database');

//console.log('Mailer is checking for sending reminders');

// For the crontab that runs once each day.
var month = moment().format("M");
var day = moment().add(1, 'days').format("DD");

// Iterate contacts from MongoDb.
getBirthdays(month, day);

function getBirthdays(m, d) {

  var queryContact = db.contactModel.aggregate({
    $match: { birthdate: { $exists: true, $ne: null }}
  },
  {
    $project: {
      name:1,
      birthdate:1,
      user_id:1,
      month: { $month: '$birthdate' },
      day: {$dayOfMonth: '$birthdate'}
    }
  },
  { 
     $match: { month: parseInt(m) , day: parseInt(d)}
  });

  queryContact.exec(function(err, results) {
    if (err) {
      console.log(err);
    }

    // Send a reminder for each contact
    if (typeof results === 'object') {

      results.forEach(function(contact){

        // Debugging
        //console.log(contact.name);

        getUser(contact);

      });
    }
  });


};

// Get user email address
function getUser(contact) {

  var queryUser = db.userModel.find({_id: { $in : [contact.user_id]}});
  queryUser.select("fullname email");
  queryUser.exec(function(err, result) {

   if (err) {
     console.log(err);
   }

   // Call for sending the reminder.
   sendReminder(contact, result);

  });

}

// Function for sending the email reminder.
function sendReminder(contact,user) {
 
  var transporter = nodemailer.createTransport({ 
    port: config.mail_port,
    ignoreTLS: true
  });

  var emailAddress = user[0].fullname + ' <' + user[0].email + '>' ; 
  //console.log('Send reminder to: ' + emailAddress); 

  transporter.sendMail({
      from: config.mail_from,
      to: emailAddress,
      subject: 'Birthday reminder for: ' + contact.name,
      text: 'Birthday: ' + moment(contact.birthdate).format('YYYY-MM-DD') + '\n'
          + contact.name + ' is getting ' + (moment().diff(contact.birthdate, 'years') + 1) + ' within one day.\n'
  });

}

setTimeout(function() {
  process.exit(0);
}, 100);

