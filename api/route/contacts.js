
var config = require('../config/config.js');
var secret = require('../config/secret');
var db = require('../config/mongo_database');

// Upload profile pictures
var fs = require('fs');
var moment = require('moment');
var quotedPrintable = require('quoted-printable');
var utf8 = require('utf8');


exports.list = function(req, res) {

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  var query = db.contactModel.find({user_id: req.user.id});
  req.query.starred === 'true' ? query.find({starred: true}) : null;
  req.query.birthdate === 'true' ? query.find({'birthdate': {$type: 9} }).sort('-birthdate') : null;
  req.query.order === 'name' ? query.sort('name') : query.sort('-last_read');
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

      // update contact so we can make stats on how many time read.
      result.update({ $inc: { read: 1 } }, function(err, nbRows, raw) {
        return res.status(200).json(result);
      });

      // update contact so we can sort contacts on last_read.
      db.contactModel.update({_id: id, user_id: req.user.id}, {last_read: new Date()} , function(err, nbRows, raw) {});

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

//exports.fileupload = function(req, res) {
//  console.log('##### test -> upload'); 
//  var filename = req.query.filename;
//  var fstream;
//  req.pipe(req.busboy);
//  req.busboy.on('file', function (fieldname, file) {
//    console.log("Uploading: " + filename); 
//    fstream = fs.createWriteStream(config.env().upload_dir + "contact_photos/" + filename);
//    file.pipe(fstream);
//    fstream.on('close', function () {
//      res.sendStatus(200); // OK
//    });
//  });
//};

exports.fileupload = function(req, res) {

  var imgPath = config.env().upload_dir + "contact_photos/" + req.body.params.filename;
  var base64Data = req.body.params.file.replace(/^data:image\/jpeg;base64,/, "");

  fs.writeFile(imgPath, base64Data, 'base64', function(err) {
    console.log('##### contactPhoto -> upload -> ' + req.body.params.filename); 
  });
};

exports.vcards = function(req, res) {

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  var query = db.contactModel.find({ user_id: req.user.id });
  query.sort('-name');
  query.exec(function(err, results) {

    if (err) {
      console.log(err);
    }

    var vcfContent;
    if (results !== null) {

      // Concat vCards
      results.forEach(function(contact){
        vcfContent += create_vCard(req, contact);
      });

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

        console.log('The file ' + vcfFile + ' has been saved!');

        // Send vcfFile as link, i.o. '/download/contacts_user_id.vcf'
        res.send(vcfFile); 

      }); 
    }
  });
};

exports.vcard = function(req, res) {

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  console.log('Create vCard for contact_id -> ' + req.body.params.contact_id); 

  var query = db.contactModel.findOne({ user_id: req.user.id, _id: req.body.params.contact_id });
  query.exec(function(err, result) {

    if (err) {
      console.log(err);
    }

    if (result !== null) {
        vcfContent = create_vCard(req, result);
        res.send(vcfContent); 
    }
  });
};

// Function for content in vCard.
function create_vCard(req, contact) {


  var dlPhones = req.body.params.phones;
  var dlCompanies = req.body.params.companies;
  var dlEmails = req.body.params.emails;
  var dlWebsites = req.body.params.websites;
  var dlPhoto = req.body.params.photo;
  var dlAddresses = req.body.params.addresses;
  var dlBirthdate = req.body.params.birthdate;
  var dlNotes = req.body.params.notes;

  // vCard Elements
  // http://www.iana.org/assignments/vcard-elements/vcard-elements.xhtml

  //var vcfContent = vcfContent || '';
  vcfContent  = "BEGIN:VCARD\n";
  vcfContent += "VERSION:3.0\n";
  vcfContent += "FN:" + contact.name + "\n";

  // Phonenumbers
  if (contact.phones.length > 0 && dlPhones) {
    contact.phones.forEach(function(phone) {
      if (phone.type) {
        vcfContent += "TEL;TYPE=" + phone.type.replace(/\s/g, '_') + ":" + phone.value + "\n";
      }
    });
  }

  // Companies
  if (contact.companies.length > 0 && dlCompanies) {
    contact.companies.forEach(function(company) {
      if (company.title) {
        vcfContent += "ORG;TYPE=" + company.title.replace(/\s/g, '_') + ":" + company.name + "\n";
      }
    });
  }

  // E-mailaddresses
  if (contact.emails.length > 0 && dlEmails) {
    contact.emails.forEach(function(email) {
      if (email.type) {
        vcfContent += "EMAIL;TYPE=" + email.type.replace(/\s/g, '_') + ":" + email.value + "\n";
      }
    });
  }

  // Websites
  if (contact.websites.length > 0 && dlWebsites) {
    contact.websites.forEach(function(website) {
      if (website.type) {
        vcfContent += "URL;TYPE=" + website.type.replace(/\s/g, '_') + ":" + website.value + "\n";
      }
    });
  }

  // Addresses
  if (contact.addresses.length > 0 && dlAddresses) {
    contact.addresses.forEach(function(address) {
      if (address.type) {
        vcfContent += "ADR;TYPE=" + address.type.replace(/\s/g, '_') + ":" + address.value + "\n";
      }
    });
  }

  // Birthdate
  if (moment(contact.birthdate).isValid() && dlBirthdate) {
    vcfContent += "BDAY:" + moment(contact.birthdate).format("YYYY-MM-DD") + "\n";
  }

  // notes
  if (contact.notes !== undefined && contact.notes.length > 0 && dlNotes) {
    vcfContent += "NOTE;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:" + quotedPrintable.encode(utf8.encode(contact.notes)) + "\n";
  }

  // Convert image to base64 encoded string only if uploaded photo exists.
  var photo = "../app/public" + contact.photo;
  if (contact.photo !== '' && fs.existsSync(photo) && dlPhoto) {
    vcfContent += "PHOTO;ENCODING=BASE64;JPEG:" + base64_encode(photo) + "\n";
  }

  vcfContent += "END:VCARD\n";

  return vcfContent;
}


// Function to encode file data to base64 encoded string.
function base64_encode(photo) {
    var image = fs.readFileSync(photo);
    return new Buffer(image).toString('base64');
}

