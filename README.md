# PIM (personal information manager)

Project has just started.....

PIM is a application built with AngularJS, Node.js, Express and MongoDB.

## Description

A private PIM with:

* Posts i.o Todo/Note/Blog/Knowledge base
* Personal calendar (not ready yet)
* Bookmarks (not ready yet)
* Register/Login/Logout users

## Dependencies

You need nodejs and mongodb (default install will do)

***Look into the packages.json file for more dependencies.***

## Installation

### The app part:

    sudo apt-get install nodejs
    git clone https://github.com/andriesfilmer/pim.git
    cd pim/app && npm install
    grunt copy    # To copy static files once.
    grunt         # With 'connect' to run a server on port 3000

The app is running on http://localhost:3000  
Change the `options.api.base_url` in `app.js` **for production** and run: 

    grunt prod

After running `grunt prod` copy the `public` folder on your webserver.

### The api part:

    sudo apt-get install mongodb
    cd api && node api.js

- The api is running on http://localhost:3001
- Change `exports.url` in config.js for production.
- Edit `api/api.js` and replace the value of `Access-Control-Allow-Origin` to match your server configuration for production.
- Run for example `forever` for your api and create a webserver configuration  
  (zie api/nginx.conf as a example).

## Resources

Inspired by the code from the articles:

* [Authentication with Angularjs and a Node rest API] (http://www.kdelemme.com/2014/03/09/authentication-with-angularjs-and-a-node-js-rest-api/) 
  [Demo]( http://projects.kdelemme.com/blog/app/#/)
* [Interceptors in Angularjs] (http://www.webdeveasy.com/interceptors-in-angularjs-and-useful-examples/)

## Licence
The MIT License (MIT)

