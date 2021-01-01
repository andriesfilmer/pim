var fs = require('fs');
//var util = require('util');
var moment = require('moment');
var utf8 = require('utf8');
var quotedPrintable = require('quoted-printable');
var s = require("underscore.string");

var config = require('../config/config.js');
var secret = require('../config/secret');
var functions = require('../functions');
var vcard = require('../vcard-json');

exports.list = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  // list all contacts.
  config.pool.getConnection(function(err, connection) {

    req.query.order === 'name' ? order = 'name' : order = 'last_read DESC';

    var limit = (typeof req.query.limit === 'undefined') ? 300 : parseInt(req.query.limit);

    if (JSON.parse(req.query.starred)) {
      var sql = "SELECT id as _id, birthdate, name, companies, starred, photo \
                 FROM contacts WHERE user_id = ? AND starred ORDER BY " + order + " limit ?";
    } else if (JSON.parse(req.query.birthdate)) {
      var sql = "SELECT id as _id, birthdate, name, companies, starred, photo \
                 FROM contacts WHERE user_id = ? AND birthdate limit ?";
    } else {
      var sql = "SELECT id as _id, birthdate, name, companies, starred, photo FROM contacts WHERE user_id = ? ORDER BY " + order + " limit ?";
    }

    query = connection.query(sql, [req.user.id, limit], function(err, results) {


      connection.release();

      if (err) throw err;

        results.forEach(function(entry) {
          entry.companies = JSON.parse(entry.companies);
        });

      return res.status(200).json(results).end(); // OK

    });

  });

};

exports.search = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  if (req.query.searchKey) {

    req.query.order === 'name' ? order = 'name' : order = 'last_read DESC';

    // list all contacts.
    config.pool.getConnection(function(err, connection) {

      var sql = "SELECT id as _id, birthdate, name, companies, starred, photo, created , updated\
                 FROM contacts WHERE (name LIKE ? \
                 OR companies LIKE ? \
                 OR phones LIKE ? \
                 OR notes LIKE ? )\
                 AND user_id = ? \
                 ORDER BY ?";
      var searchFor = '%' + req.query.searchKey + '%';

      var query = connection.query(sql, [searchFor, searchFor, searchFor, searchFor, req.user.id, order], function(err, results) {

        connection.release();

        if (err) throw err;

        results.forEach(function(entry) {
          entry.companies = JSON.parse(entry.companies);
        });

        return res.status(200).json(results).end(); // OK

      });
    });
  }
};

exports.read = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  config.pool.getConnection(function(err, connection) {

    var sql = "SELECT id as _id, name, companies, photo, phones, emails, websites, addresses, notes, birthdate, created, updated, starred \
               FROM contacts WHERE id= ? AND user_id = ? LIMIT 1";

    var query = connection.query(sql, [req.params.id, req.user.id], function(err, results) {

      var query = connection.query('UPDATE contacts \
          SET times_read = times_read+1, last_read = ? \
          WHERE id = ? AND user_id = ?',
          [moment.utc().format('YYYY-MM-DD HH:mm'), req.params.id,req.user.id], function (err, results, fields) {

        if (err) {
          console.log(err);
          return res.status(400).send(err.sqlMessage).end(); // Bad Request
        }

      });

      connection.release();

      if (err) throw err;

      if (results.length === 0) {
        return res.status(404).send('Not found').end();
      }
      else {

        // Parse json strings from database.
        results[0].phones = JSON.parse([results[0].phones]);
        results[0].companies = JSON.parse([results[0].companies]);
        results[0].emails = JSON.parse([results[0].emails]);
        results[0].websites = JSON.parse([results[0].websites]);
        results[0].addresses = JSON.parse([results[0].addresses]);

        return res.status(200).json(results[0]).end(); // OK

      }
    });

  });
};

exports.create = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  var contact = req.body.contact;
  if (!contact) {
    res.status(400).send('Bad Request').end();
  }

  var createContact = checkContact(contact);

  if (createContact.err) {
    return res.status(createContact.err).send(createContact.msg).end();
  }
  else {

    createContact.user_id = req.user.id;

    config.pool.getConnection(function(err, connection) {

      var query = connection.query('INSERT INTO contacts SET ?', createContact, function (err, results, fields) {

        connection.release();

        if (err) {
          console.log(err);
          return res.status(400).send(err.sqlMessage).end(); // Bad Request
        }
        else {
          return res.status(200).send('Created contact id:' + results.insertId + ' successfully').end();
        }

      });

    });

  }
}

exports.update = function(req, res) {

  if (!req.user) {
    return res.send(401); // Not authorized
  }

  var contact = req.body.contact;

  if (!contact) {
    return res.status(400).send('Bad request').end();
  }

  // Id required.
  if (contact._id == null) {
    return res.status(400).send('Bad request - id required').end();
  }

  var updateContact = checkContact(contact, req.user.id);
  var setkeys = Object.keys(updateContact).map(item => `${item} = ?`);
  var values = Object.values(updateContact);
  values.push(contact._id,req.user.id);

  config.pool.getConnection(function(err, connection) {

    var query = connection.query("UPDATE contacts SET " + setkeys + " WHERE id = ? AND user_id = ?",
        values, function (err, results, fields) {

      if (err) {
        console.log(err);
        return res.status(400).send(err.sqlMessage).end(); // Bad Request
      }

    });

    // Don't create a version copy if name not exitst, i.o. update for starred.
    if (contact.name) {
      var createCopy = {'org_id': contact._id, 'user_id': req.user.id };
      var createVersion = Object.assign(updateContact, createCopy);
      delete createVersion.updated;

      var query = connection.query('INSERT INTO contactversions SET ?', createVersion, function (err, results, fields) {

        if (err) {
          console.log(err);
          return res.status(400).send(err.sqlMessage).end(); // Bad Request
        }
        else {
          return res.status(200).send('Updated contact successfully').end(); // OK
        }

      });
    }
    else {
      return res.status(200).send('Updated contact successfully').end(); // OK
    }

    connection.release();

  });

};

exports.delete = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  if (!req.params.id) {
    res.status(400).send('Bad request - Undefined id').end(); // Bad request
  }

  config.pool.getConnection(function(err, connection) {

    var query = connection.query("DELETE FROM contacts WHERE id = ? AND user_id = ?",
        [req.params.id,req.user.id], function (err, results, fields) {

      connection.release();

      if (err) {
        console.log(err);
        return res.status(400).send(err.sqlMessage).end(); // Bad Request
      }
      else {
        console.log(moment().format('YYYY-MM-DD') + ' user: ' + req.user.id + ' deleted -> contact_id: ' + req.params.id);
        var photo = config.env().upload_dir + req.user.id + "/contacts/" + req.params.id + '.jpg';
        if (fs.existsSync(photo)){ fs.unlinkSync(photo); }
        return res.status(200).send('Deleted contact successfully').end(); // OK
      }

    });

  });
};

exports.listVersions = function(req, res) {

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  var query = config.pool.getConnection(function(err, connection) {

    var sql = "SELECT id as _id, name, created \
               FROM contactversions WHERE org_id = ? AND user_id = ? ORDER BY created DESC";

    query = connection.query(sql, [req.params.id, req.user.id], function(err, results) {

      connection.release();

      if (err) throw err;

      return res.status(200).json(results).end(); // OK

    });
  });
};

exports.readVersion = function(req, res) {

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  if (!req.params.id === '') {
    return res.sendStatus(400); // Bad Request
  }
  config.pool.getConnection(function(err, connection) {

    var sql = "SELECT id as _id, org_id, phones, emails, addresses, companies, websites, name, birthdate, notes, phones_fax, starred, photo \
               FROM contactversions WHERE id= ? AND user_id = ? LIMIT 1";

    var query = connection.query(sql, [req.params.id, req.user.id], function(err, results) {

      connection.release();

      if (err) throw err;

      if (results.length === 0) {
        return res.status(404).send('Not found').end();
      }
      else {

        // Parse json strings from database.
        //results[0].companies = JSON.parse([results[0].companies]);
        results[0].phones = JSON.parse([results[0].phones]);
        results[0].companies = JSON.parse([results[0].companies]);
        results[0].emails = JSON.parse([results[0].emails]);
        results[0].websites = JSON.parse([results[0].websites]);
        results[0].addresses = JSON.parse([results[0].addresses]);

        return res.status(200).json(results[0]).end(); // OK
      }
    });
  });
};

exports.photoUpload = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  var filename = savePhotoUri(req.user.id, req.body.params.contact_id, req.body.params.dataUrl);
  var photoPath = '/upload/' + req.user.id + "/contacts/" + filename;
  res.status(200).json({contact: {photo: photoPath}}).end(); // OK

};

exports.vCardsUpload = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  var contactDir = config.env().upload_dir + req.user.id + "/contacts/";
  if (!fs.existsSync(contactDir)){ functions.mkdir(contactDir); }

  // First save upload file to disk
  req.pipe(req.busboy);
  req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {

    if (mimetype.toString() === 'text/vcard' || mimetype.toString() === 'text/x-vcard') {

      var vCardPath = contactDir + filename;

      fstream = fs.createWriteStream(vCardPath);
      file.pipe(fstream);
      fstream.on('close', function() {
        console.log("Upload Finished of " + vCardPath);
        importContacts(vCardPath);
      });
    }
    else {
      return res.status(400).send('File type must be text/vcard').end();
    }
  });

  // Function to import contacts from file
  function importContacts(vCards) {
    console.log('Import contacts from file -> ' + vCards);
    vcard.parseVcardFile(vCards, function(err, data){
      if(err) {
        return res.status(400).send('Bad Request parseVcardFile').end();
      }
      else {

        // Debug info, uncomment/include 'utils' at the top.
        //console.log(util.inspect(data, false, null));

        count = 0;
        data.forEach(function(contact) {

          var contactEntry = checkContact(contact);

          contactEntry.user_id = req.user.id;
          count++;

          // Save contact to db.
          config.pool.getConnection(function(err, connection) {

            var query = connection.query('INSERT INTO contacts SET ?', contactEntry, function (err, results, fields) {

              if (err) {
                console.log(err);
                return res.status(400).send(err.sqlMessage).end(); // Bad Request
              }

              // If it has a photo_uri we want to save the picture on file with new created id.
              if (contact.photo_uri) {

                savePhotoUri(req.user.id, results.insertId, contact.photo_uri);
              }

            });

            connection.release();

          });

        });

        res.status(200).send(count + ' contact(s) imported successfully').end();

      }

    });

  } // End function importContacts

};

exports.vcardsDownload = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  config.pool.getConnection(function(err, connection) {

    var sql = 'SELECT id, user_id, name, phones, emails, addresses,\
               companies, websites, name, birthdate, notes, starred, photo \
               FROM contacts WHERE user_id = ? ORDER BY name';

    query = connection.query(sql, [req.user.id], function(err, results) {

      connection.release();

      if (err) {
        console.log(err);
        res.status(500).send(err);
      }

      if (results) {

        // Concat vCards
        var vcfContent = '';
        results.forEach(function(contact){

          contact.companies = JSON.parse([contact.companies]);
          contact.phones = JSON.parse([contact.phones]);
          contact.emails = JSON.parse([contact.emails]);
          contact.websites = JSON.parse([contact.websites]);
          contact.addresses = JSON.parse([contact.addresses]);

          vcfContent += create_vCard(req, contact);

        });

        // Download as file.
        // -----------------------------------------------------------------
        // var downloadDir = '../app/public/download/' + req.user.id + '/';
        // if (!fs.existsSync(downloadDir)){
        //   functions.mkdir(downloadDir);
        // }
        // var vcfFile = 'contacts.vcf';
        //
        // // vcfContent can be to big for sendFile so we create a local file to download.
        // fs.writeFile(downloadDir + vcfFile, vcfContent, function(err) {
        //
        //   if(err) {
        //     console.log(err);
        //     res.status(500).send('Internal Server Error');
        //   }
        //
        //   console.log('The file ' + vcfFile + ' has been saved!');
        //
        //   // Send vcfFile as link
        //   res.status(200).send('/download/' + req.user.id + '/' + vcfFile).end();
        // -----------------------------------------------------------------
        // });

        // Download as stream.
        res.status(200).send(vcfContent).end();

      }
    });
  });
};

exports.vcardDownload = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  console.log('Create vCard for contact_id -> ' + req.body.params.contact_id);

  config.pool.getConnection(function(err, connection) {

    var sql = 'SELECT id as _id, user_id, name, phones, emails, addresses,\
               companies, websites, name, birthdate, notes,starred, photo \
               FROM contacts WHERE id = ? AND user_id = ? ORDER BY name';

    query = connection.query(sql, [req.body.params.contact_id, req.user.id], function(err, results) {

      connection.release();

      if (err) {
        console.log(err);
        res.status(500).send('Internal Server Error').end();
      }

      if (results) {
          // Parse json strings from database.
          results[0].companies = JSON.parse([results[0].companies]);
          results[0].phones = JSON.parse([results[0].phones]);
          results[0].emails = JSON.parse([results[0].emails]);
          results[0].websites = JSON.parse([results[0].websites]);
          results[0].addresses = JSON.parse([results[0].addresses]);
          vcfContent = create_vCard(req, results[0]);
          res.status(200).send(vcfContent).end();
      }
    });
  });
};

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
  vcfContent += "N:" + utf8.encode(s(contact.name).strRight(' ').clean().value()) + ',' + utf8.encode(s(contact.name).strLeft(' ').clean().value()) + ";;;;\n";
  vcfContent += "FN:" + utf8.encode(s(contact.name).clean().value()) + "\n";

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
      if (company.type) {
        if (company.type === undefined || company.type === null) company.type = '';
        vcfContent += "ORG;TYPE=" + company.type.replace(/\s/g, '_') + ":" + company.value + "\n";
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
  if (contact.notes && dlNotes) {
    vcfContent += "NOTE;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:" + quotedPrintable.encode(utf8.encode(contact.notes)) + "\n";
  }

  // Convert image to base64 encoded string only if uploaded photo exists.
  var photo = config.env().upload_dir.replace('/upload/','') + contact.photo;
  if (contact.photo && fs.existsSync(photo) && dlPhoto) {
    var photoProp = "PHOTO;ENCODING=BASE64;JPEG:" + base64_encode(photo);
    vcfContent += photoProp.replace(/(.{1,73})/g, '$1 \r\n ') + '\n';
  }
  vcfContent += "END:VCARD\n";

  return vcfContent;
}



// Function to encode file data to base64 encoded string.
function base64_encode(photo) {
    var image = fs.readFileSync(photo);
    return new Buffer(image).toString('base64');
}

function savePhotoUri(user_id, contact_id, dataUrl) {

  // Check if the filetype is supported.
  fileTypeCheckRegex = /^data:image\/(png|jpeg);base64/;
  if (fileTypeCheckRegex.test(dataUrl)){

    fileTypeRegex = /^data:image\/png;base64/;
    if (fileTypeRegex.test(dataUrl)){
      filename = contact_id + ".png";
    } else{
      filename = contact_id + ".jpg";
    }
  }
  else {
    console.log('User_id: ' + user_id + ' contact_id: ' + contact_id + ' -> FileType not supported');
    filename = '.unknown';
  }

  var imgDir = config.env().upload_dir + user_id + "/contacts/";
  if (!fs.existsSync(imgDir)){ functions.mkdir(imgDir); }
  var imgPath = imgDir + filename;

  // HTMLCanvasElement.toDataURL(), JPEG and PNG file.types are accepted.
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL
  var base64Data = dataUrl.replace(/^data:image\/(jpeg|png);base64,/, "");

  fs.writeFile(imgPath, base64Data, 'base64', function(err) {
    if(err) {console.log(err);}
  });

  config.pool.getConnection(function(err, connection) {
    photo = '/upload/' + user_id + '/contacts/' + filename;
    var query = connection.query('UPDATE contacts SET photo = ? WHERE id = ?', [filename, contact_id], function (err, results, fields) {

      if (err) {
        console.log(err);
        return res.status(400).send(err.sqlMessage).end(); // Bad Request
      }

    });
  });

  return filename;

}

// Check values for input db.
function checkContact (contact, user_id = null) {

  var checkedContact = {};

  if (contact == null) {
    return checkedContact = { err: 400, msg: 'Bad request - No contact available' };
  }

  if (contact.name) {
    checkedContact.name = contact.name;
  }

  if (contact.companies) {
    checkedContact.companies = JSON.stringify(contact.companies);
  }

  if (contact.phones) {
    checkedContact.phones = JSON.stringify(contact.phones);
  }

  if (contact.emails) {
    checkedContact.emails = JSON.stringify(contact.emails);
  }

  if (contact.websites) {
    checkedContact.websites = JSON.stringify(contact.websites);
  }

  if (contact.addresses) {
    checkedContact.addresses = JSON.stringify(contact.addresses);
  }

  if (contact.birthdate) {
    checkedContact.birthdate = moment(contact.birthdate).format('YYYY-MM-DD');
  }

  if (typeof contact.starred !== 'undefined') {
    checkedContact.starred = contact.starred;
  }

  if (contact.photo == '') {
    var photo = config.env().upload_dir + user_id + "/contacts/" + contact._id + '.jpg';
    if (fs.existsSync(photo)){ fs.unlinkSync(photo); }
    checkedContact.photo = null;
  }
  if (contact.photo) {
    checkedContact.photo = contact.photo;
  }

  if (contact.notes) {
    checkedContact.notes = contact.notes;
  }

  checkedContact.updated = new Date();

  return checkedContact;
}

