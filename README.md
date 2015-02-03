# PIM (personal information manager)

PIM is a application built with AngularJS, Node.js, Express and MongoDB.

## Description

A private PIM with:

* Register/Login/Logout users
* Posts i.o Todo/Note/Blog/Knowledge base
* Personal calendar (appiontments, memos)
* Contacts (not ready yet)
* Bookmarks (not ready yet)

## Dependencies

You need nodejs and mongodb (default install will do)

***Look into the packages.json file for more dependencies.***

## Installation

### The app part:

    sudo apt-get install nodejs
    git clone https://github.com/andriesfilmer/pim.git
    cd pim/app && npm install
    grunt once    # To copy and compile vendor files once.
    grunt         # With 'connect' to run a server on port 3000

The app is running on http://localhost:3000  
Change the `options.api.base_url` in `app.js` **for production** and run: 

    grunt production

After running `grunt production` copy the `public` folder on your webserver.

### The api part:

Create a file `api/config/secret.js`

    exports.mongodbURL = 'mongodb://pim:yourpassword@localhost/pim';
    exports.secretToken = 'feb5ed8--your-secret-token--rzeSFejmplc';

Install MongoDb and run the api.

    sudo apt-get install mongodb
    cd api && NODE_ENV=production node api.js

- The api is running on http://localhost:3001
- Change `exports.url` in config.js for production.
- Edit `api/config/env.json` and replace the value of `cors_url` (Access-Control-Allow-Origin) to match your server configuration for your enviroment.
- Run `node api.js` for your api or `forever api.js` and create a webserver configuration  
  (zie api/nginx.conf as a example).

## Reminders for calendar events

I you want reminders 24 hours before each event (that what I like).
Create a `cron` for each 5 minutes: `*/5 * * * * /usr/bin/node /path/to/api/mailer.js`

## Credits

I use a lot off NPM Packages and Bower Packages. Look in `packages.json` and `bower.json`.
Many thanks for the maintainers!

## Resources

Inspired by the code from the articles:

* [Authentication with Angularjs and a Node rest API] (http://www.kdelemme.com/2014/03/09/authentication-with-angularjs-and-a-node-js-rest-api/) 
  [Demo]( http://projects.kdelemme.com/blog/app/#/)
* [Interceptors in Angularjs] (http://www.webdeveasy.com/interceptors-in-angularjs-and-useful-examples/)

## Licence

The MIT License (MIT)

