
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

  // list all contacts or starred contacts.
  var query = db.contactModel.find({user_id: req.user.id});
  req.query.starred === 'true' ? query.find({starred: true}) : null;
  req.query.order === 'name' ? query.sort('name') : query.sort('-last_read');
  query.select("_id birthdate name companies starred photo");
  query.limit(req.query.limit);

  // List only contacts with birthdates order by month,dayOfMonth.
  var queryBirthdates = db.contactModel.aggregate([
    { "$match": {
        "user_id": req.user.id,
        "birthdate": {$type: 9}
      }
    },
    {"$project": {
        "name": 1,
        "birthdate": 1,
        "photo": 1,
        "updated": 1,
        "month": { "$month": "$birthdate" },
        "dayOfMonth": { "$dayOfMonth": "$birthdate" }
      }
    },
    {"$sort": {
        "month": 1,
        "dayOfMonth": 1
      }
    }
  ]);

  // use default query or aggregate query 
  if (req.query.birthdate === 'true') { query = queryBirthdates };

  query.exec(function(err, results) {

    if (err) {
      console.log(err);
      return res.status(500).send('Internal Server error');
    }

    if (results !== null) {
      return res.status(200).json(results); // OK
    }
    else {
      return res.status(404).send('Not found'); 
    }

  });

};

exports.search = function(req, res) {

  if (!req.user) {
    res.sendStatus(401); // Unauthorized
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
      res.status(500).send('Internal Server Error');
    }

    res.status(200).json(results);

  });

};

exports.read = function(req, res) {

  if (!req.user) {
    res.sendStatus(401); // Unauthorized
  }

  var id = req.params.id || '';
  if (id === '') {
    res.status(400).send('Bad Request');
  }

  var query = db.contactModel.findOne({ _id: id, user_id: req.user.id });
  query.select('_id name companies photo phones emails websites addresses relations notes birthdate created updated starred');
  query.exec(function(err, result) {

    if (err) {
        console.log(err); 
        res.status(500).send('Internal Server Error'); 
    }

    if (result === null) {
      res.status(400).send('Contact does not exists'); // Bad Request
    }
    else {

      // update contact so we can make stats on how many time read.
      result.update({ $inc: { read: 1 } }, function(err, nbRows, raw) {});

      // update contact so we can sort contacts on last_read.
      db.contactModel.update({_id: id, user_id: req.user.id}, {last_read: new Date()} , function(err, nbRows, raw) {});

      res.status(200).json(result);

    }

  });
}; 

exports.create = function(req, res) {

  if (!req.user) {
    res.sendStatus(401); // Unauthorized
  }

  var contact = req.body.contact;
  if (contact === null) {
    res.status(400).send('Bad Request'); 
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
      console.log(err); 
      res.status(400).send('Bad Request'); 
    }

    res.status(200).send('Contact created successful');

  });
}

exports.update = function(req, res) {

  if (!req.user) {
    res.send(401); // Not authorized
  }

  var contact = req.body.contact;
  if (contact == null) {
    res.status(400).send('Bad Request');
  }

  var updateContact = {};

  // Title required
  if (contact.name !== null && contact.name !== "" && contact.name !== undefined) {
    updateContact.name = contact.name;
  }

  if (contact.companies !== undefined) {
    updateContact.companies = contact.companies;
  }

  if (contact.phones !== undefined) {
    updateContact.phones = contact.phones;
  }

  if (contact.emails !== undefined) {
    updateContact.emails = contact.emails;
  }

  if (contact.websites !== undefined) {
    updateContact.websites = contact.websites;
  }

  if (contact.addresses !== undefined) {
    updateContact.addresses = contact.addresses;
  }

  if (contact.relations !== undefined) {
    updateContact.relations = contact.relations;
  }

  if (contact.starred !== undefined) {
    updateContact.starred = contact.starred;
  }

  if (contact.photo !== undefined) {
    updateContact.photo = contact.photo;
  }

  if (contact.birthdate !== undefined || contact.birthdate === null) {
    updateContact.birthdate = contact.birthdate;
  }

  if (contact.notes !== undefined) {
    updateContact.notes = contact.notes;
  }

  updateContact.updated = new Date();

  db.contactModel.update({_id: contact._id, user_id: req.user.id}, updateContact, function(err, nbRows, raw) {

    if (err) {
      console.log(err); 
      res.status(400).send('Bad Request'); 
    }

    res.status(200).send('Update contact successfull');

  });

};

exports.delete = function(req, res) {

  if (!req.user) {
    res.sendStatus(401); // Unauthorized
  }

  var id = req.params.id;
  if (id === undefined || id === '') {
    res.status(400).send('Undefined id'); // Bad request
  }

  var query = db.contactModel.findOne({_id: id});

  query.exec(function(err, result) {

    if (err) {
      console.log(err);
      res.status(400).send('Bad Request');
    }

    if (result !== null) {
      result.remove();
      res.status(200).send('contact ' + id + ' deleted').end();
    }
    else {
      res.status(404).send('Not Found'); 
    }

  });
};

exports.fileupload = function(req, res) {

  // Check if the filetype is supported.
  fileTypeCheckRegex = /^data:image\/(png|jpeg);base64/;
  if (fileTypeCheckRegex.test(req.body.params.dataUrl)){

    fileTypeRegex = /^data:image\/png;base64/;
    if (fileTypeRegex.test(req.body.params.dataUrl)){
      filename = req.body.params.contact_id + ".png";
    } else{
      filename = req.body.params.contact_id + ".jpg";
    } 
  }
  else {
    res.status(400).send('FileType not supported'); // Bad Request
  }

  var imgDir = config.env().upload_dir + req.user.id + "/contacts/";
  if (!fs.existsSync(imgDir)){ mkdir(imgDir); }
  var imgPath = imgDir + filename;

  // HTMLCanvasElement.toDataURL(), JPEG and PNG file.types are accepted.
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL
  var base64Data = req.body.params.dataUrl.replace(/^data:image\/(jpeg|png);base64,/, "");

  fs.writeFile(imgPath, base64Data, 'base64', function(err) {

    if(err) {
      console.log(err); 
      res.status(500).send('Internal Server Error');
    }
    else {
      console.log('Contact photo -> upload -> ' + req.body.params.contact_id); 
      var photo = '/upload/' + req.user.id + "/contacts/" + filename;
      res.status(200).json({contact: {photo: photo}});
    }

  });
};

exports.vcards = function(req, res) {

  if (!req.user) {
    res.sendStatus(401); // Unauthorized
  }

  var query = db.contactModel.find({ user_id: req.user.id });
  query.sort('-name');
  query.exec(function(err, results) {

    if (err) {
      console.log(err);
      res.status(500).send(err);
    }

    if (results !== null) {

      // Concat vCards
      var vcfContent = '';
      results.forEach(function(contact){
        vcfContent += create_vCard(req, contact);
      });

      // Create a crontab to remove old files from public download.
      var downloadDir = '../app/public/download/' + req.user.id + '/';
      if (!fs.existsSync(downloadDir)){ 
        mkdir(downloadDir); 
      }
      var vcfFile = 'contacts.vcf';

      // vcfContent can be to big for sendFile so we create a local file to download.
      fs.writeFile(downloadDir + vcfFile, vcfContent, function(err) {

        if(err) {
          console.log(err); 
          res.status(500).send('Internal Server Error');
        }

        console.log('The file ' + vcfFile + ' has been saved!');

        // Send vcfFile as link
        res.status(200).send('/download/' + req.user.id + '/' + vcfFile);

      }); 
    }
  });
};

exports.vcard = function(req, res) {

  if (!req.user) {
    res.sendStatus(401); // Unauthorized
  }

  console.log('Create vCard for contact_id -> ' + req.body.params.contact_id); 

  var query = db.contactModel.findOne({ user_id: req.user.id, _id: req.body.params.contact_id });
  query.exec(function(err, result) {

    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    }

    if (result !== null) {
        vcfContent = create_vCard(req, result);
        res.status(200).send(vcfContent);
    }
  });
};

// Recursive creation of dirs.
function mkdir(path, root) {

    var dirs = path.split('/'), dir = dirs.shift(), root = (root || '') + dir + '/';

    try { fs.mkdirSync(root); }
    catch (e) {
        //dir wasn't made, something went wrong
        if(!fs.statSync(root).isDirectory()) throw new Error(e);
    }

    return !dirs.length || mkdir(dirs.join('/'), root);
}

// Content for one vCard.
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
  var photo = "../app/pubic" + contact.photo;
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

