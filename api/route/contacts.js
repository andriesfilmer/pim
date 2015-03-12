
var config = require('../config/config.js');
var secret = require('../config/secret');
var db = require('../config/mongo_database');

// Upload profile pictures
var fs = require('fs');

exports.list = function(req, res) {

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  var query = db.contactModel.find({user_id: req.user.id});
  req.query.starred === 'true' ? query.find({starred: true}) : null;
  query.select("_id name companies starred photo");
  query.sort('-updated');
  query.limit(req.query.limit);
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

exports.search = function(req, res) {

  var contacts = req.query; 

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  if (contacts.searchKey) {
    var query = db.contactModel.find({ $or: [ 
                                          {name:   { $exists: true, $regex: contacts.searchKey, $options: 'i' } },
                                          {"companies.name": { $exists: true, $regex: contacts.searchKey, $options: 'i' } }, 
                                          {"phones.value": { $exists: true, $regex: contacts.searchKey, $options: 'i' } }, 
                                          {notes: { $exists: true, $regex: contacts.searchKey, $options: 'i' } } 
                                         ],user_id: req.user.id } );
  } else {
    var query = db.contactModel.find({ user_id: req.user.id });
  }

  query.select("_id name companies created updated starred");
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
  query.select('_id name companies photo phones emails websites addresses relations notes birthdate created updated starred');
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
  contactEntry.companies = contact.companies;
  contactEntry.starred = contact.starred;
  contactEntry.phones = contact.phones;
  contactEntry.emails = contact.emails;
  contactEntry.websites = contact.websites;
  contactEntry.addresses = contact.addresses;
  contactEntry.photo = contact.photo;
  contactEntry.birthdate = contact.birthdate;
  contactEntry.notes = contact.notes;

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

  if (contact.companies !== undefined) {
    updateContact.companies = contact.companies;
  }

  if (contact.phones != undefined) {
    updateContact.phones = contact.phones;
  }

  if (contact.emails != undefined) {
    updateContact.emails = contact.emails;
  }

  if (contact.websites != undefined) {
    updateContact.websites = contact.websites;
  }

  if (contact.addresses != undefined) {
    updateContact.addresses = contact.addresses;
  }

  if (contact.relations != undefined) {
    updateContact.relations = contact.relations;
  }

  if (contact.starred != undefined) {
    updateContact.starred = contact.starred;
  }

  if (contact.photo !== undefined) {
    updateContact.photo = contact.photo;
  }

  if (contact.birthdate != undefined || contact.birthdate === null) {
    updateContact.birthdate = contact.birthdate;
  }

  if (contact.notes != undefined) {
    updateContact.notes = contact.notes;
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
  if (id == undefined || id == '') {
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

exports.fileupload = function(req, res) {
  var filename = req.query.filename;
  var fstream;
  req.pipe(req.busboy);
  req.busboy.on('file', function (fieldname, file) {
    console.log("Uploading: " + filename); 
    fstream = fs.createWriteStream(config.default_upload_photo_dir + filename);
    file.pipe(fstream);
    fstream.on('close', function () {
      res.sendStatus(200); // OK
    });
  });
};
