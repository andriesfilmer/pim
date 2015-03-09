# PIM (personal information manager)

PIM is a application built with AngularJS, Node.js, Express and MongoDB.

## Description

A private PIM with:

* Register/Login/Logout users
* Posts i.o Todo/Note/Blog/Knowledge base
* Personal calendar (Appiontments, Memos)
* Contacts (Add unlimited Phonenumbers, Companies, Relations, E-mailaddresses, Websites, Addresses)
* Bookmarks (With tags and notes)

[Demo site](http://pim.filmer.nl)


## Dependencies

You need nodejs and mongodb (default install will do)

## Installation

### The app part:

    git clone https://github.com/andriesfilmer/pim.git
    cd pim/app && npm install
    grunt once    # To copy and compile vendor files once.
    grunt         # For development with 'connect' to run a server

The app is running on http://localhost:3000  
Change the `options.api.base_url` in `app.js` **for production** and run: 

    grunt production

After running `grunt production` copy the `public` folder to your webserver.

### The api part:

Create a file `api/config/secret.js`

    exports.mongodbURL = 'mongodb://pim:yourpassword@localhost/pim';
    exports.secretToken = 'feb5ed8--your-secret-token--rzeSFejmplc';

Run the api in development

    cd api && NODE_ENV=development node api.js

Run the api in production

    cd api && NODE_ENV=production node api.js

- The api is running on http://localhost:3001
- Change `exports.url` in config.js to your needs.
- Edit `api/config/env.json` and replace the value of `cors_url` (Access-Control-Allow-Origin) to match your server configuration and your enviroment.
- Create a `cron` for running your api after reboot: `@reboot export NODE_ENV=production && /path/to/your/api/starter.sh` and create a upstream proxy  
  (zie api/nginx.conf as a example).

## Reminders for calendar events

If you want reminders 24 hours before each event (that what I like).
Create a `cron` for each 5 minutes: `*/5 * * * * export NODE_ENV=production && /usr/bin/node /path/to/api/mailer.js`

## Credits

- [Zurb Foundation](http://foundation.zurb.com)
- [Adam Shaw - Fullcalendar](http://fullcalendar.io/)
- [Markdown from Eric J Nesser](http://daringfireball.net/projects/markdown/)

And many more, look in `app/package.json` and `api/package.json`. Many thanks for the maintainers!

## Licence

The MIT License (MIT)

