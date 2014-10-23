# PIM (personal information manager)

Project is just started.....

PIM is a simple application built with AngularJS, Node.js and MongoDB.

## Description

A private PIM with:

* Personal calendar
* Posts i.o Todo/Note/Blog/
* Bookmarks
* Register/Login/Logout users

## Dependencies

You need nodejs and mongodb (default install will do)

Look into the packages.json file for more dependencies.

## Installation

### The app part:

   sudo apt-get install nodejs
   sudo apt-get install mongodb
   cd app && npm install
   grunt copy 
   grunt 

The app is running on http://localhost:3000

### The api part:

   cd api && node api.js

The api is running on http://localhost:3001

Edit api/api.js and replace the value of Access-Control-Allow-Origin to match your server configuration for production.

## Resources

Inspired by the code is from these articles:

* [Authentication with Angularjs and a Node rest API] (http://www.kdelemme.com/2014/03/09/authentication-with-angularjs-and-a-node-js-rest-api/) 
  [Demo]( http://projects.kdelemme.com/blog/app/#/)
* [Interceptors in Angularjs] (http://www.webdeveasy.com/interceptors-in-angularjs-and-useful-examples/)

## Licence
The MIT License (MIT)

