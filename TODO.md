# General
- jwt token feedback must be better form the api
- FastClick https://github.com/ftlabs/fastclick
- Sync-it https://www.npmjs.com/package/sync-it
- https://github.com/angular-translate/angular-translate

# Calendar
- New event does not show immediately
- export vCal
- import vCal
- install angular-ui-calendar minified

# Contact
- import vCard
- download/share vCard

# Issues
- Share PDF with bullet list does not work correct with <ul><li>


db.contacts.find({ photo: {$exists: true}}).forEach(function(contact) {
   db.contacts.update({_id: contact._id}, {
     $set: { "photo": '/upload/' + contact.user_id + '/contacts/' + contact._id + '.jpg'  }
    })
});
