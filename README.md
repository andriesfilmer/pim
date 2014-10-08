# PIM (personal information manager)

Project is just started.....

PIM is a simple application built with AngularJS, Node.js and MongoDB.
Responsive design with bootstrap.

## Description

A privat PIM with:
* Blog/KnowlageBase/Notes
* Kalendar
* Bookmarks

## Dependencies

You need nodejs and mongodb (default install will do)

Look into the packages.json file`for more dependencies.

## Installation

The app part:

   sudo apt-get install nodejs
   sudo apt-get install mongodb
   cd app && npm install
   grunt 

The api part:

   cd api && node api.js

The app is running on http://localhost:3000
The api is running on http://localhost:3001

Create a first account on `http://localhost:3000/#/admin/register`
To access the Administration, go to `http://localhost/#/admin/login`

Edit api/api.js and replace the value of Access-Control-Allow-Origin to match your server configuration for production.

## Resources

Inspired by the code is from the artile:
Article: http://www.kdelemme.com/2014/03/09/authentication-with-angularjs-and-a-node-js-rest-api/

Demo: http://projects.kdelemme.com/blog/app/#/

### Changes from the project of Kevin Delemme:

- [x] Grunt instead of Gulp
- [x] Sass instead of Less
- [x] No need of Redis
- [x] Markdown instead of wysihtml5
- [x] Responsive design, mobile first
- [x] Removed likes, its for my personal use ;)
- [x] Uptimized by jshint

## Licence
The MIT License (MIT)

