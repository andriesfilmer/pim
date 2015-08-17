
var config = require('../config/config.js');
var secret = require('../config/secret');
var db = require('../config/mongo_database');

// Upload profile pictures
var fs = require('fs');
var moment = require('moment');
var mimelib = require("mimelib");
var quotedPrintable = require('quoted-printable');
var utf8 = require('utf8');


exports.list = function(req, res) {

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  var query = db.contactModel.find({user_id: req.user.id});
  req.query.starred === 'true' ? query.find({starred: true}) : null;
  req.query.birthdate === 'true' ? query.find({'birthdate': {$type: 9} }).sort('-birthdate') : null;
  req.query.order === 'name' ? query.sort('name') : query.sort('-updated');
  query.select("_id birthdate name companies starred photo");
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

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  if (req.query.searchKey) {
    var query = db.contactModel.find({ $or: [ 
                                          {name:   { $exists: true, $regex: req.query.searchKey, $options: 'i' } },
                                          {"companies.name": { $exists: true, $regex: req.query.searchKey, $options: 'i' } }, 
                                          {"phones.value": { $exists: true, $regex: req.query.searchKey, $options: 'i' } }, 
                                          {"phones.type": { $exists: true, $regex: req.query.searchKey, $options: 'i' } }, 
                                          {notes: { $exists: true, $regex: req.query.searchKey, $options: 'i' } } 
                                         ],user_id: req.user.id } );
  } else {
    var query = db.contactModel.find({ user_id: req.user.id });
  }

  req.query.birthdate === 'true' ? query.find({'birthdate': {$type: 9} }) : null;
  query.select("_id name birthdate companies created updated starred");
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

exports.download = function(req, res) {

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  //console.log('##### req.query :'); 
  //console.dir(req.query); 

  var vcfContent = '';
  var dlPhones = req.query.phones;
  var dlCompanies = req.query.companies;
  var dlEmails = req.query.emails;
  var dlWebsites = req.query.websites;
  var dlPhoto = req.query.photo;
  var dlAddresses = req.query.addresses;
  var dlBirthdate = req.query.birthdate;
  var dlNotes = req.query.notes;

  var query = db.contactModel.find({ user_id: req.user.id });
  query.sort('-name');
  query.exec(function(err, results) {

    if (err) {
      console.log(err);
    }

    if (results !== null) {
      create_vCards(results);
    }

    // The name off the file is a bit cyrptic so you don't leave a obvious file to download for anonymous.
    var vcfFile = 'contacts_' + req.user.id + '.vcf';
    var downloadDir = "../app/public/download/";
    if (!fs.existsSync(downloadDir)){
      fs.mkdirSync(downloadDir);
    }
    fs.writeFile(downloadDir + vcfFile, vcfContent, function(err) {

      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");

      // Send vcfFile as link, i.o. '/download/contacts_user_id.vcf'
      res.send(vcfFile); 

    }); 

    // Function for content in vCard.
    function create_vCards(contacts) {
      results.forEach(function(contact){

        // Debug
        //console.log('##### Fullname -> ' + contact.name); 

        // vCard Elements
        // http://www.iana.org/assignments/vcard-elements/vcard-elements.xhtml

        vcfContent += "BEGIN:VCARD\n";
        vcfContent += "VERSION:3.0\n";
        vcfContent += "FN:" + contact.name + "\n";

        // Phonenumbers
        if (contact.phones.length > 0 && dlPhones == 'true') {
          contact.phones.forEach(function(phone) {
            if (phone.type) {
             vcfContent += "TEL;TYPE=" + phone.type.replace(/\s/g, '_') + ":" + phone.value + "\n";
            }
          });
        }

        // Companies
        if (contact.companies.length > 0 && dlCompanies == 'true') {
          contact.companies.forEach(function(companies) {
            if (companies.title) {
             vcfContent += "ORG;TYPE=" + companies.title.replace(/\s/g, '_') + ":" + companies.name + "\n";
            }
          });
        }

        // E-mailaddresses
        if (contact.emails.length > 0 && dlEmails == 'true') {
          contact.emails.forEach(function(emails) {
            if (emails.type) {
             vcfContent += "EMAIL;TYPE=" + emails.type.replace(/\s/g, '_') + ":" + emails.value + "\n";
            }
          });
        }

        // Websites
        if (contact.websites.length > 0 && dlWebsites == 'true') {
          contact.websites.forEach(function(websites) {
            if (websites.type) {
             vcfContent += "URL;TYPE=" + websites.type.replace(/\s/g, '_') + ":" + websites.value + "\n";
            }
          });
        }

        // Addresses
        if (contact.addresses.length > 0 && dlAddresses == 'true') {
          contact.addresses.forEach(function(addresses) {
            if (addresses.type) {
             vcfContent += "ADR;TYPE=" + addresses.type.replace(/\s/g, '_') + ":" + addresses.value + "\n";
            }
          });
        }

        // Birthdate
        if (moment(contact.birthdate).isValid() && dlBirthdate == 'true') {
             vcfContent += "BDAY:" + moment(contact.birthdate).format("YYYY-MM-DD") + "\n";
        }

        // notes
        if (contact.notes !== undefined && contact.notes.length > 0 && dlNotes == 'true' ) {
          vcfContent += "NOTE;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:" + quotedPrintable.encode(utf8.encode(contact.notes)) + "\n";
        }

        // Convert image to base64 encoded string only if uploaded photo exists.
        var photo = "../app/public" + contact.photo;
        if (fs.existsSync(photo) && dlPhoto == 'true') {
          vcfContent += "PHOTO;ENCODING=BASE64;JPEG:" + base64_encode(photo) + "\n";
        }

        vcfContent += "END:VCARD\n";

      });

    }

    // Function to encode file data to base64 encoded string.
    function base64_encode(photo) {
        var image = fs.readFileSync(photo);
        return new Buffer(image).toString('base64');
    }

  });

};
