# PIM (personal information manager)

PIM is a application built with AngularJS, Node.js, Express and MongoDB.

## Description

A private PIM with:

* Register/Login/Logout users - With reset password.
* Posts/Notes/Articles
* Personal calendar (Appointments, Memos), Timezone awarenss.
* Contacts (Add unlimited Phonenumbers, Companies, Relations, E-mailaddresses, Websites, Addresses)
* Bookmarks (With tags and notes)

Take a look on the [PIM.center](http://pim.center) for more features.


## Dependencies

You need npm, nodejs and mongodb (default install will do)

## Install

### The app part:

    git clone https://github.com/andriesfilmer/pim.git
    cd pim/app && npm install
    grunt once    # To copy and compile vendor files once.
    grunt         # For development with 'connect' to run a server

The app is running on http://localhost:3000  
Change the `options.api.base_url` in `services.js` -> `AuthenticationService` **for production** and run: 

    grunt production

After running `grunt production` copy the `public` folder to your webserver.

### The api part:

    cd pim/api && npm install

Create a file `api/config/secret.js`

    exports.mongodbURL = 'mongodb://pim:yourpassword@localhost/pim';
    exports.secretToken = 'feb5ed8--your-secret-token--rzeSFejmplc';

Run the api in development

    cd api && NODE_ENV=development node api.js

Run the api in production

    cd api && NODE_ENV=production node api.js

- The api is running on http://localhost:3001
- Change `api/config/env.json` to your needs.
- Edit `api/config/env.json` and replace the value of `cors_url` (Access-Control-Allow-Origin) to match your server configuration and your enviroment.
- Create a `cron` for running your api after reboot: `@reboot export NODE_ENV=production;/usr/local/bin/forever start --sourceDir /var/www/pim.filmer.net/current/api api.js` 
- Create a upstream proxy  (zie api/nginx.conf as a example).


## Reminders by e-mail

If you want event reminders before each event (default 1 day), you can create a cron.
Take a look in `api/sendEventReminder.js` and create a crontab.

If you want birhtdatereminders before each event (default 1 day), you can create a cron.
Take a look in `api/sendBirthdayReminder.js` and create a crontab.

## Credits

- [Zurb Foundation](http://foundation.zurb.com)
- [Momentjs](http://momentjs.com/)
- [Adam Shaw - Fullcalendar](http://fullcalendar.io/)
- [Markdown - Eric J Nesser](http://daringfireball.net/projects/markdown/)
- [Cropper - Fengyuan Chen](https://github.com/fengyuanchen/cropper)

And many more, look in `app/package.json` and `api/package.json`. Many thanks for the maintainers!

## Licence for PIM.center

The MIT License (MIT)

