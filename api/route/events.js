var fs = require('fs');
var moment = require('moment');
var quotedPrintable = require('quoted-printable');
//var util = require('util');

var secret = require('../config/secret');
var config = require('../config/config.js');
var calendar = require('../vcalendar-json');
var functions = require('../functions');


exports.list = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  if (req.query.end === undefined) { req.query.end = '3000-01-01' };

  // Remove quotes and use only date (YYYY-mm-dd) for select.
  var start = req.query.start.replace(/"/g,'').substr(0,10);
  var end = req.query.end.replace(/"/g,'').substr(0,10);

  config.pool.getConnection(function(err, connection) {

    var sql = 'SELECT id as _id, user_id,title, start, end, allDay, tz, className \
               FROM events WHERE start <= ? AND end >= ? AND user_id = ? \
               ORDER BY start LIMIT 500';

    var query = connection.query(sql, [end, start, req.user.id], function(err, results) {

      connection.release();

      if (err) throw err;

      results.forEach(function(entry) {
        entry.start = moment.utc(entry.start).format();
        entry.end = moment.utc(entry.end).format();
      });

      return res.status(200).json(results); // OK

    });
  });
};

// Search calendar
exports.search = function(req, res) {

  var calendar = req.query;

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  if (req.query.searchKey) {

    // list all contacts.
    config.pool.getConnection(function(err, connection) {

      var sql = "SELECT id as _id, title, start, end , allDay, className, created, updated \
                 FROM events WHERE (title LIKE ? OR description LIKE ? )\
                 AND user_id = ? \
                 ORDER BY start DESC LIMIT 100";
      var searchFor = '%' + req.query.searchKey + '%';

      var query = connection.query(sql, [searchFor, searchFor, req.user.id], function(err, results) {

        connection.release();

        if (err) throw err;

        results.forEach(function(entry) {
          entry.start = moment.utc(entry.start).format();
          entry.end = moment.utc(entry.end).format();
        });

        return res.status(200).json(results); // OK

      });

    });
  }

};

exports.read = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  config.pool.getConnection(function(err, connection) {

    var sql = "SELECT id as _id, title, start, end, CASE WHEN allDay = 0 THEN 'false' ELSE 'true' END AS allDay, tz, description, className, created, updated \
               FROM events WHERE id= ? AND user_id = ? LIMIT 1";

    var query = connection.query(sql, [req.params.id, req.user.id], function(err, results) {

      connection.release();

      if (err) throw err;

      if (results.length === 0) {
        return res.status(404).send('Not found').end();
      }
      else {

        //results[0].allDay = JSON.parse(results[0].allDay);
        results[0].start = moment.utc(results[0].start).format();
        results[0].end = moment.utc(results[0].end).format();

        return res.status(200).json(results[0]); // OK
      }

    });
  });
};

exports.create = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  var event = req.body.calendar;
  var createEvent = checkEvent(event);

  if (createEvent.err) {
    return res.status(createEvent.err).send(createEvent.msg).end();
  }
  else {

    createEvent.user_id = req.user.id;

    config.pool.getConnection(function(err, connection) {

      var query = connection.query('INSERT INTO events SET ?', createEvent, function (err, results, fields) {

        connection.release();

        if (err) {
          console.log(err);
          return res.status(400).send(err.sqlMessage).end(); // Bad Request
        }
        else {
          return res.status(200).send('Created event id:' + results.insertId + ' successfully');
        }

      });

    });
  }
}

exports.update = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  var event = req.body.calendar;

  // Id required.
  if (event._id == null) {
    return res.status(400).send('Bad request - id required').end();
  }

  var updateEvent = checkEvent(event);

  config.pool.getConnection(function(err, connection) {

    var query = connection.query("UPDATE events SET title = ?, start = ?, end = ?, description = ?,\
                className = ?, allDay= ?, tz = ?, updated = ? WHERE id = ?",
                [updateEvent.title,updateEvent.start, updateEvent.end, updateEvent.description,
                updateEvent.className, updateEvent.allDay, updateEvent.tz, updateEvent.updated,
                event._id], function (err, results, fields) {

      connection.release();

      if (err) {
        console.log(err);
        return res.status(400).send(err.sqlMessage).end(); // Bad Request
      }
      else {
        return res.status(200).send('Updated event successfully'); // OK
      }

    });
  });
}

exports.delete = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  var id = req.params.id;
  if (id === null || id === undefined || id === '') {
    return res.status(400).send('Bad request - id required').end();
  }

  config.pool.getConnection(function(err, connection) {

    var query = connection.query("DELETE FROM events WHERE id = ? AND user_id = ?",
                [id, req.user.id], function (err, results, fields) {

      connection.release();

      if (err) {
        console.log(err);
        return res.status(400).send(err.sqlMessage).end(); // Bad Request
      }
      else {
        return res.status(200).send('Deleted event successfully'); // OK
      }

    });

  });

};

exports.vCalendarUpload = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  // Todo: make check if file is uploaded (exists).

  var calendarDir = config.env().upload_dir + req.user.id + "/calendars/";
  if (!fs.existsSync(calendarDir)) { functions.mkdir(calendarDir); }

  // First save upload file to disk
  req.pipe(req.busboy);
  req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {

    if (mimetype.toString() === 'text/calendar') {

      var vCalendarPath = calendarDir + filename;

      fstream = fs.createWriteStream(vCalendarPath);
      file.pipe(fstream);
      fstream.on('close', function() {
        console.log("Upload Finished of " + vCalendarPath);
        importEvents(vCalendarPath);
      });
    }
    else {
      return res.status(400).send('File type must be text/calendar').end();
    }
  });

  // Function to import calendars from file
  function importEvents(vCalendar) {
    console.log('Import calendars from file -> ' + vCalendar);
    calendar.parseVcalendarFile(vCalendar, function(err, data){
      if(err) {
        return res.status(400).send('Bad Request parseCalendarFile');
      }
      else {

        // Debug info, uncomment/include 'utils' at the top.
        //console.log(util.inspect(data, false, null));

        count = 0;
        data.forEach(function(event) {

          var eventEntry = checkEvent(event);
          eventEntry.user_id = req.user.id;
          count++;

          // If no 'PIM-CLASSNAME' property is included in the EVENT
          // we use 'importclassname' form the header which comes from PIM.center.
          if (event.className) {
            eventEntry.className = event.className;
          }
          else if (req.headers.importclassname) {
            eventEntry.className = req.headers.importclassname
          }

          // Save event to db.
          config.pool.getConnection(function(err, connection) {

            var query = connection.query('INSERT INTO events SET ?', eventEntry, function (err, results, fields) {

              connection.release();

              if (err) {
                console.log(err);
                return res.status(400).send(err.sqlMessage).end(); // Bad Request
              }

            });

          });

        });

        res.status(200).send(count + ' events successful created').end();
      }

    });

  } // End function importCalendars

};

exports.veventsDownload = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  config.pool.getConnection(function(err, connection) {

    var sql = 'SELECT id as _id, user_id,title, start, end, description, allDay, tz, className \
               FROM events WHERE user_id = ? ORDER BY start';

    query = connection.query(sql, [req.user.id], function(err, results) {

      connection.release();

      if (err) {
        console.log(err);
        res.status(500).send(err);
      }

      if (results) {
        var icsContent = '';
        icsContent  += "BEGIN:VCALENDAR\n";
        icsContent  += "VERSION:2.0\n";
        results.forEach(function(event){
          icsContent += create_vEvent(event);
        });
        icsContent += "END:VCALENDAR\n";

        // Download as data stream.
        res.status(200).send(icsContent);
      }
      else {
        return res.status(404).send('Not found');
      }

    });

  });

};

exports.veventDownload = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  console.log('Create vEvent for event_id -> ' + req.body.params.event_id);

  config.pool.getConnection(function(err, connection) {

    var sql = 'SELECT * FROM events WHERE id = ? AND user_id = ?';

    query = connection.query(sql, [req.body.params.event_id, req.user.id], function(err, result) {

      connection.release();

      if (err) {
        console.log(err);
        res.status(500).send(err);
      }

      if (result) {
        var icsContent = '';
        icsContent += "BEGIN:VCALENDAR\n";
        icsContent += "VERSION:2.0\n";
        icsContent += create_vEvent(result[0]);
        icsContent += "END:VCALENDAR\n";

        // Download as data stream.
        res.status(200).send(icsContent);
      }
      else {
        return res.status(404).send('Not found');
      }

    });

  });
};


// Content for one vevent.in ics format.
function create_vEvent(event) {

  icsContent  = 'BEGIN:VEVENT\n';
  icsContent += 'SUMMARY:' + event.title + '\n';
  icsContent += 'DTSTART;TZID=' + event.tz + ':' + moment.utc(moment(event.start).isValid() ? event.start : "").toISOString().replace(/(:|-)/g,'') + '\n';
  icsContent += 'DTEND;TZID=' + event.tz + ':' + moment.utc(moment(event.end).isValid() ? event.end : "").toISOString() + '\n';
  icsContent += 'PIM-CLASSNAME:' + event.className + '\n';
  // Description SHOULD NOT be longer than 75 octets, excluding the line break
  if (event.description !== undefined) {
    var desc = 'DESCRIPTION:' + event.description;
    icsContent += desc.replace(/\t/g,' ').replace(/(\r\n|\n|\r)/g,'\\n').replace(/(.{1,73})/g, '$1 \r\n');
  }
  icsContent += 'END:VEVENT\n';

  return icsContent;
}


// Check values for input db.
function checkEvent (event) {

  var checkedEvent = {};

  if (event == null) {
    return checkedEvent = { err: 400, msg: 'Bad request - No event available' };
  }

  // Title required.
  if (event.title) {
    checkedEvent.title = event.title;
  }
  else {
    return checkedEvent = { err: 400, msg: 'Bad request - Title required' };
  }

  if (event.tz) {
    checkedEvent.tz = event.tz;
  }
  else {
    return checkedEvent = { err: 400, msg: 'Bad request - Timezone required' };
  }

  // Start required.
  if (event.start) {
    checkedEvent.start = moment.utc(event.start).format('YYYY-MM-DD HH:mm');
  }
  else {
    return checkedEvent = { status: 400, msg: 'Bad request - Start required' };
  }

  if (event.end) {
    checkedEvent.end = moment.utc(event.end).format('YYYY-MM-DD HH:mm');
  }
  else {
    // Set end with one hour if no end time is given.
    checkedEvent.end = moment(checkedEvent.start,'YYYY-MM-DD HH:mm').add(1,'hour').format('YYYY-MM-DD HH:mm');
  }

  if (event.tz) {
    checkedEvent.tz = event.tz;
  }

  if (event.description) {
    checkedEvent.description = event.description;
  }

  if (event.className) {
    checkedEvent.className = event.className;
  }

  checkedEvent.allDay = event.allDay;
  checkedEvent.updated = new Date();

  return checkedEvent;
}


