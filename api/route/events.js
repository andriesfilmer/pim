var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

var secret = require('../config/secret');
var db = require('../config/mongo_database');

exports.list = function(req, res) {

  if (!req.user) {
    return res.send(401); // Unauthorized
  }

  // Remove quotes and use only date (YYYY-mm-dd)
  var start = req.query.start.replace(/"/g,"").substr(0,10);
  var end = req.query.end.replace(/"/g,"").substr(0,10);

  var query = db.eventModel.find({"start": {"$gte": start, "$lte": end}, user_id: req.user.id }).limit(500);
  query.select("_id title start end allDay className");
  query.sort('start');
  query.exec(function(err, results) {
    if (err) {
      console.log(err);
      return res.sendStatus(400); // Bad Request
    }
    return res.status(200).json(results); // OK
  });

};

// Search calendar
exports.search = function(req, res) {

  var calendar = req.query; 

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  if (calendar.searchKey) {
    var query = db.eventModel.find({ $or: [ 
                                          {title:   { $exists: true, $regex: calendar.searchKey, $options: 'i' } },
                                          {description: { $exists: true, $regex: calendar.searchKey, $options: 'i' } }, 
                                         ],user_id: req.user.id } ).limit(100);
  } else {
    var query = db.eventModel.find({ user_id: req.user.id });
  }

  query.select("_id title start end allDay className created updated");
  query.sort('-updated');
  query.exec(function(err, results) {

    if (err) {
      console.log(err);
      return res.sendStatus(400); // Bad Request
    }

    if (results !== null) {
      return res.status(200).json(results); // OK
    }
    else {
      return res.sendStatus(404); // Not Found
    }

  });

};

exports.read = function(req, res) {

  console.log('Event get id: ' + req.params.id); 

  if (!req.user) {
    return res.send(401); // Unauthorized
  }

  var id = req.params.id || '';
  if (id == '') {
    return res.send(406); // Not Acceptable
  }

  var query = db.eventModel.findOne({ _id: id, user_id: req.user.id });
  query.select('_id title start end allDay description className created updated');
  query.exec(function(err, result) {
    if (err) {
        console.log(err);
        return res.send(400); // Bad Request
    }

    if (result !== null) {
      return res.status(200).json(result);
    } else {
      return res.sendStatus(404); // Not found
    }
  });

}; 

exports.create = function(req, res) {

  console.log('Event create -> with user_id -> ' + req.user.id); 

  if (!req.user) {
    return res.send(401); // Unauthorized
  }

  var event = req.body.calendar;
  if (event == null) {
    return res.sendStatus(400); // Bad Request
  }

  var createEvent = new db.eventModel();

  createEvent.user_id = req.user.id;

  // Title required
  if (event.title !== undefined && event.title !== null && event.title !== "") {
    createEvent.title = event.title;
  }
  else {
    return res.sendStatus(400); // Bad Request
  }

  // Start required
  if (event.start !== undefined && event.start !== "" && event.start !== null) {
    createEvent.start = event.start;
  }
  else {
    return res.sendStatus(400); // Bad Request
  }

  if (event.end !== undefined) {
    createEvent.end = event.end;
  }

  if (event.description !== undefined) {
    createEvent.description = event.description;
  }

  if (event.className !== undefined) {
    createEvent.className = event.className;
  }

  if (event.allDay !== undefined) {
    createEvent.allDay = event.allDay;
  }

  createEvent.save(function(err) {
    if (err) {
      console.log(err);
      return res.sendStatus(400); // Bad Request
    }
    return res.sendStatus(200).end();
  });
}

exports.update = function(req, res) {

  //console.dir(req.body.calendar);

  if (!req.user) {
    return res.send(401); // Unauthorized
  }

  var event = req.body.calendar;

  if (event == null || event._id == null) {
    res.sendStatus(404); // Not found
      console.log('404 - Not Found'); 
  }

  // Title required
  var updateEvent = {};
  if (event.title !== undefined && event.title !== "" && event.title !== null) {
    updateEvent.title = event.title;
  }
  else {
    return res.sendStatus(400); // Bad Request
  }

  // Start required
  if (event.start !== undefined && event.start !== "" && event.start !== null) {
    updateEvent.start = event.start;
  }
  else {
    return res.sendStatus(400); // Bad Request
  }

  if (event.end !== undefined) {
    updateEvent.end = event.end;
  }

  if (event.description !== undefined) {
    updateEvent.description = event.description;
  }

  if (event.allDay !== undefined) {
    updateEvent.allDay = event.allDay;
  }

  if (event.className !== undefined) {
    updateEvent.className = event.className;
  }

  updateEvent.updated = new Date();

  db.eventModel.update({_id: event._id, user_id: req.user.id}, updateEvent, function(err, nbRows, raw) {
    console.log('Event update -> id: ' + event._id); 
    if (err) {
      console.log(err);
      return res.sendStatus(400);
      console.log('Event update error -> id: ' + event._id); 
    }
    return res.sendStatus(200).end();
  });
};

exports.delete = function(req, res) {

  console.dir(req.params);

  if (!req.user) {
    return res.send(401); // Unauthorized
  }

  var id = req.params.id;
  if (id === null || id === undefined || id === '') {
    res.send(400); // Bad request
  }

  var query = db.eventModel.findOne({_id: id, user_id: req.user.id});
  query.exec(function(err, result) {
    if (err) {
      console.log(err);
      return res.send(400); // Bad request
    }

    if (result !== null) {
      result.remove();
      console.log('Event -> deleted -> id: ' + id); 
      return res.sendStatus(200).end();
    }
    else {
      return res.sendStatus(400); // Bad request
    }

  });
};

