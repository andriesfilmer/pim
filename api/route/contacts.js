
var secret = require('../config/secret');
var db = require('../config/mongo_database');

exports.list = function(req, res) {

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  console.log('##### contact req.query #####'); 
  console.dir(req.query);

  var query = db.contactModel.find({user_id: req.user.id}).limit(req.query.limit);

  query.select("_id name relation tags created updated starred");
  query.sort('-updated');
  query.exec(function(err, results) {

    if (err) {
      console.log(err);
      return res.sendStatus(400); // Bad Request
    }

    //if (results !== null) {
      return res.status(200).json(results); // OK
    //
    //else {
    //  return res.sendStatus(404); // Not Found
    //

  });

};

exports.search = function(req, res) {

  var contacts = req.query; 

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  if (contacts.searchKey) {
    //console.log('Contact search -> ' + contacts.searchKey); 
    var query = db.contactModel.find({ $or: [ 
                                          {name:   { $exists: true, $regex: contacts.searchKey, $options: 'i' } },
                                          {note: { $exists: true, $regex: contacts.searchKey, $options: 'i' } }, 
                                          {tags:    { $exists: true, $regex: contacts.searchKey, $options: 'i' } } 
                                         ],user_id: req.user.id } );
  } else {
    //console.log('Contact empty search -> Show all'); 
    var query = db.contactModel.find({ user_id: req.user.id });
  }

  query.select("_id name relation tags created updated starred");
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

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  var id = req.params.id || '';
  if (id === '') {
    return res.sendStatus(400); // Bad Request
  }

  var query = db.contactModel.findOne({ _id: id, user_id: req.user.id });
  query.select('_id name tags phones emails addresses relation note created updated starred');
  query.exec(function(err, result) {

    if (err) {
        console.log(err);
        return res.sendStatus(400); // Bad Request
    }

    if (result != null) {
      result.update({ $inc: { read: 1 } }, function(err, nbRows, raw) {
        return res.status(200).json(result);
      });
    }
    else {
      return res.sendStatus(400); // Bad Request
    }

  });
}; 

exports.create = function(req, res) {

  console.log('##### post req.body #####'); 
  console.dir(req.body);

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  var contact = req.body.contact;
  if (contact == null) {
    return res.sendStatus(400); // Bad Request
  }

  var contactEntry = new db.contactModel();

  contactEntry.user_id = req.user.id;
  contactEntry.name = contact.name;
  contactEntry.starred = contact.starred;
  contactEntry.phones = contact.phones;
  contactEntry.emails = contact.emails;
  contactEntry.addresses = contact.addresses;
  contactEntry.note = contact.note;

  // Tags are comma separated
  if (contact.tags != null) {
    if (Object.prototype.toString.call(contact.tags) === '[object Array]') {
      contactEntry.tags = contact.tags;
    }
    else {
      contactEntry.tags = contact.tags.split(',');
    }
  }

  contactEntry.save(function(err) {
    if (err) {
      return res.sendStatus(400); // Bad Request
    }

    return res.sendStatus(200).end();

  });
}

exports.update = function(req, res) {

  if (!req.user) {
    return res.send(401); // Not authorized
  }

  var contact = req.body.contact;
  if (contact == null) {
    res.sendStatus(400); // Bad request
  }

  var updateContact = {};

  // Title required
  if (contact.name !== null && contact.name !== "" && contact.name !== undefined) {
    updateContact.name = contact.name;
  }

  console.log('##### test -> phones'); 
  console.dir(contact.phones);

  if (contact.phones != null) {
    updateContact.phones = contact.phones;
  }
  updateContact.emails = contact.emails;
  updateContact.addresses = contact.addresses;

  // Convert commaseparate tags to objects.
  if (contact.tags != null) {
    if (Object.prototype.toString.call(contact.tags) === '[object Array]') {
      updateContact.tags = contact.tags;
    }
    else {
      updateContact.tags = contact.tags.split(',');
    }
  }

  if (contact.relation != null) {
    updateContact.relation = contact.relation;
  }

  if (contact.starred != null) {
    updateContact.starred = contact.starred;
  }

  if (contact.note != null && contact.note != "") {
    updateContact.note = contact.note;
  }

  updateContact.updated = new Date();

  db.contactModel.update({_id: contact._id, user_id: req.user.id}, updateContact, function(err, nbRows, raw) {
    return res.status(200).end();
  });

};

exports.delete = function(req, res) {

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  var id = req.params.id;
  if (id == null || id == '') {
    res.sendStatus(400); // Bad request
  }

  var query = db.contactModel.findOne({_id:id});

  query.exec(function(err, result) {
    if (err) {
      console.log(err);
      return res.sendStatus(400); // Bad request
    }

    if (result != null) {
      result.remove();
      return res.sendStatus(200).end();
      console.log('Contact -> delete'); 
    }
    else {
      return res.sendStatus(404); // Not Found
    }

  });
};

exports.listByTag = function(req, res) {

  var tagName = req.params.tagName || '';
  if (tagName == '') {
    return res.sendStatus(400);
  }

  var query = db.contactModel.find({tags: tagName, starred: true, user_id: req.user.id });
  query.select('_id name tags relation created updated starred');
  query.sort('-created');
  query.exec(function(err, results) {
    if (err) {
      console.log(err);
      return res.sendStatus(400);
    }

    for (var contactKey in results) {
      results[contactKey].note = results[contactKey].note.substr(0, 400);
    }

    return res.status(200).json(result);
  });
}

