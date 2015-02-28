## Info about the upgrade from admin.fimer.nl (mysql) to pim.filmer.nl (mongodb)

### Query for mysql2json (zie next)

    SELECT contacts.contact_id,
    naw.naw_id AS naw_id,
    concat(contacts.voornaam, ' ',contacts.tussen,' ',contacts.achternaam) AS name,
    naw.bedrijf AS company_name,
    contacts.functie AS company_title,
    contacts.email AS email0,
    contacts.gebdatum AS birthdate,
    contacts.telefoon as phone_personal,
    contacts.mobile as phone_mobile,
    contacts.prive_telefoon phone_private,
    naw.telefoon as phone_work,
    naw.fax as phones_fax,
    naw.internet as website,
    concat(trim(naw.bezoekadres),', ', naw.bezoekpostcode, ' ' , naw.bezoekplaats) AS address0,
    concat(trim(naw.postadres),', ', naw.postpostcode, ' ' , naw.postplaats) AS address1,
    concat(trim(naw.invoiceLine3), ', ', naw.invoiceLine4, ' ', naw.invoiceLine5, '', naw.invoiceLine6) AS address2,
    naw.notities AS notes,
    naw.created AS created,
    naw.updated AS updated
    FROM naw INNER JOIN contacts ON (naw.naw_id=contacts.naw_id) limit 1;


### Create a collection from the tables `naw` and `contacts`

    mysql2json -u root -p Mtivohs10m -d andries --execute="the--above--sql--query" > contacts.json

### Import the collection and overwrite the old one

    mongoimport -c contacts -d pim --file contacts.json --type json  --jsonArray --drop

### Add a user_id to these contacts

    db.contacts.update({},{$set: {user_id: '54c4dee88c87fffa24dcda90'}}, {multi: true})

### Create sub collection for company

    db.contacts.find().forEach(function(contact) {
      db.contacts.update({contact_id: contact.contact_id}, {
        $set: {
          "company": {
            title: contact.company_title, 
            name: contact.company_name
          }
        } 
      })
    });

### Create sub collections for phones.

    db.contacts.find().forEach(function(contact) {
      db.contacts.update({contact_id: contact.contact_id}, {
        $set: {
          "phones": [
            {
              type: 'Mobile', 
              value: contact.phone_mobile
            },
            {
              type: 'Personal', 
              value: contact.phone_personal
            },
            {
              type: 'Private', 
              value: contact.phone_private
            },
            {
              type: 'Work', 
              value: contact.phone_work
            },
            {
              type: 'Fax', 
              value: contact.phone_fax
            }
          ]
        }
      })
    });

### Create sub collections for email.

    db.contacts.find().forEach(function(contact) {
      db.contacts.update({contact_id: contact.contact_id}, {
        $set: {
          "emails": [
            {
              type: 'Personal', 
              value: contact.email0
            }
          ]
        }
      })
    });

### Create sub collections for websites.

    db.contacts.find().forEach(function(contact) {
      db.contacts.update({contact_id: contact.contact_id}, {
        $set: {
          "websites": [
            {
              type: 'Work', 
              value: contact.website
            }
          ]
        }
      })
    });

### Create sub collections for addresses.

    db.contacts.find().forEach(function(contact) {
      db.contacts.update({contact_id: contact.contact_id}, {
        $set: {
          "addresses": [
            {
              type: 'Home', 
              value: contact.address0
            },
            {
              type: 'Work', 
              value: contact.address1
            },
            {
              type: 'Post', 
              value: contact.address2
            }
          ]
        }
      })
    });


## CLEAN UP FIELDS

### Remove absolent fields

    db.contacts.find().forEach(function(contact) { 
      db.contacts.update({
        contact_id: contact.contact_id
      }, 
      {
        $unset: {
          company_name: 1,
          company_title: 1,
          phone_mobile: 1,
          phone_personal: 1,
          phone_private: 1,
          phone_fax: 1,
          phone_work: 1,
          email0: 1,
          address0: 1,
          address1: 1,
          address2: 1,
          website: 1
        } 
      })
    });


### Remove empty value's (`$type: 6` are null values)

    db.contacts.update({}, {$pull: {"phones": {"value":""}}}, { multi: true });
    db.contacts.update({}, {$pull: {"phones": {"value": { $type: 6 }}}}, { multi: true });
    db.contacts.update({}, {$pull: {"emails": {"value":""}}}, { multi: true });
    db.contacts.update({}, {$pull: {"websites": {"value":""}}}, { multi: true });
    db.contacts.update({}, {$pull: {"addresses": {"value":",  "}}}, { multi: true });
    db.contacts.update({ birthdate: "0000-00-00" }, { $unset : { birthdate: 1} }, {multi: true});


