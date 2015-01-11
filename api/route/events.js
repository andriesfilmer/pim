var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

var secret = require('../config/secret');
var db = require('../config/mongo_database');

exports.list = function(req, res) {

  if (!req.user) {
    return res.send(401); // Unauthorized
  }

  var query = db.eventModel.find({user_id: req.user.id});
  query.select("_id title start end allDay description");
  query.exec(function(err, results) {
    if (err) {
      console.log(err);
      return res.send(400); // Bad Request
    }
    return res.status(200).json(results); // OK
  });

};

exports.read = function(req, res) {
  console.log('Event get id: ' + req.params.id); 

  if (!req.user) {
    return res.send(401); // Unauthorized
  }

  var id = req.params.id || '';
  if (id == '') {
    return res.send(400); // Bad Request
  }

  var query = db.eventModel.findOne({ _id: id, user_id: req.user.id });
  query.select('_id title start end allDay description created updated');
  query.exec(function(err, result) {
    if (err) {
        console.log(err);
        return res.send(400); // Bad Request
    }

    if (result != null) {
      result.update({ $inc: { read: 1 } }, function(err, nbRows, raw) {
        return res.status(200).json(result);
      });
    } else {
      return res.sendStatus(400); // Bad Request
    }
  });
}; 

exports.create = function(req, res) {

  if (!req.user) {
    return res.send(401); // Unauthorized
  }
  console.log('Event create -> with user_id -> ' + req.user.id); 

  var event = req.body.calendar;
  if (event == null || event.title == null ) {
    return res.sendStatus(400); // Bad Request
  }

  var createEvent = new db.eventModel();

  createEvent.user_id = req.user.id;

  if (event.title != null && event.title != "") {
    createEvent.title = event.title;
  }
  else {
    createEvent.title = 'Empty title';
  }

  if (event.start != null && event.start != "") {
    createEvent.start = event.start;
  }

  if (event.end != null && event.end != "") {
    createEvent.end = event.end;
  }

  if (event.description != null && event.description != "") {
    createEvent.description = event.description;
  }

  createEvent.allDay = event.allDay;

  createEvent.save(function(err) {
    if (err) {
      console.log(err);
      return res.send(400);
    }

    return res.status(200).end();

  });
}

exports.update = function(req, res) {

  console.log('##### req.body.calendar #####'); 
  console.dir(req.body.calendar);

  if (!req.user) {
    return res.send(401); // Unauthorized
  }

  var event = req.body.calendar;

  if (event == null || event._id == null) {
    res.sendStatus(400); // Bad request
      console.log('Error no _id!'); 
  }

  var updateEvent = {};
  if (event.title != undefined && event.title != "") {
    updateEvent.title = event.title;
  }
  if (event.start != undefined && event.start != "") {
    updateEvent.start = event.start;
  }
  if (event.end != undefined && event.end != "") {
    updateEvent.end = event.end;
  }
  if (event.description !== undefined && event.description !== "") {
    updateEvent.description = event.description;
  }
  if (event.allDay !== undefined) {
    updateEvent.allDay = event.allDay;
  }
  updateEvent.updated = new Date();

  db.eventModel.update({_id: event._id, user_id: req.user.id}, updateEvent, function(err, nbRows, raw) {
    console.log('Event update -> id: ' + event._id); 
    if (err) {
      console.log(err);
      return res.sendStatus(400);
      console.log('Event update error -> id: ' + event._id); 
    }
    return res.status(200).end();
  });
};

exports.delete = function(req, res) {

  if (!req.user) {
    return res.send(401); // Unauthorized
  }

  var id = req.params.id;
  if (id == null || id == '') {
    res.send(400); // Bad request
  }

  var query = db.eventModel.findOne({_id: id, user_id: req.user.id});
  query.select("_id title start end allDay description");
  query.exec(function(err, result) {
    if (err) {
      console.log(err);
      return res.send(400); // Bad request
    }

    if (id !== undefined) {
      result.remove();
      console.log('Event -> deleted -> id: ' + id); 
      return res.status(200).end();
    }
    else {
      return res.send(400);
    }

  });
};


