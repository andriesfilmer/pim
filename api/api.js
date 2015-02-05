var express = require('express');

/**************/
// Middleware */
/**************/

// Validates JsonWebTokens and set req.user.
var expressJwt = require('express-jwt');

// body-parsing middleware to populate req.body.
var bodyParser = require('body-parser');

// CORS - Access-Control-Allow-Origin
var cors = require('cors');

/**************/
// Config     */
/**************/

// This file is in .gitignore. You have to create it (zie readme.md)
var secret = require('./config/secret');

var config = require('./config/config.js');
var config = config.env();
var corsOptions = { origin: config.cors_url}; 

// Use Express Framework.
var app = express();

// For production use upstream (nginx.conf).
app.listen(config.api_port);

app.use(cors(corsOptions));
app.use(bodyParser());

// Enable http logging
//var morgan  = require('morgan'); 
//app.use(morgan());

console.log('API (' + config.name + ') is starting on port ' + config.api_port);

// Routes
var routes = {};
routes.users = require('./route/users.js');
routes.events = require('./route/events.js');
routes.posts = require('./route/posts.js');
routes.bookmarks = require('./route/bookmarks.js');

/*******************/
// User routes     */
/*******************/
app.post('/user/register', routes.users.register); 

// Login
app.post('/user/signin', routes.users.signin); 

// Logout
app.get('/user/logout', routes.users.logout); 

/*******************/
/* Event routes    */
/*******************/

// Get all events
app.get('/calendar', expressJwt({secret: secret.secretToken}), routes.events.list);

// Search events
app.get('/calendar/search', expressJwt({secret: secret.secretToken}), routes.events.search);

// Get the event (id)
app.get('/calendar/:id', expressJwt({secret: secret.secretToken}), routes.events.read); 

// Create a new event item
app.post('/calendar', expressJwt({secret: secret.secretToken}), routes.events.create); 

// Update event item (id)
app.put('/calendar', expressJwt({secret: secret.secretToken}), routes.events.update); 

// Delete event item (id)
app.delete('/calendar/:id', expressJwt({secret: secret.secretToken}), routes.events.delete); 

/*******************/
/* Posts routes    */
/*******************/

// Get posts by tag
app.get('/tag/:tagName', routes.posts.listByTag); 

// Get all public posts
app.get('/post/public', routes.posts.listPublic);

// Search posts
app.get('/post/search', expressJwt({secret: secret.secretToken}), routes.posts.search);

// Get all posts
app.get('/post', expressJwt({secret: secret.secretToken}), routes.posts.list);

// Get the post id
app.get('/post/:id', expressJwt({secret: secret.secretToken}), routes.posts.read); 

// Create a new post
app.post('/post', expressJwt({secret: secret.secretToken}), routes.posts.create); 

// Edit the post id
app.put('/post', expressJwt({secret: secret.secretToken}), routes.posts.update); 

// Delete the post id
app.delete('/post/:id', expressJwt({secret: secret.secretToken}), routes.posts.delete); 

/*******************/
/* Posts routes    */
/*******************/

// Get bookmarks by tag
app.get('/tag/:tagName', routes.bookmarks.listByTag); 

// Get all public bookmarks
app.get('/bookmark/public', routes.bookmarks.listPublic);

// Search bookmarks
app.get('/bookmark/search', expressJwt({secret: secret.secretToken}), routes.bookmarks.search);

// Get all bookmarks
app.get('/bookmark', expressJwt({secret: secret.secretToken}), routes.bookmarks.list);

// Get the bookmark id
app.get('/bookmark/:id', expressJwt({secret: secret.secretToken}), routes.bookmarks.read); 

// Create a new bookmark
app.post('/bookmark', expressJwt({secret: secret.secretToken}), routes.bookmarks.create); 

// Edit the bookmark id
app.put('/bookmark', expressJwt({secret: secret.secretToken}), routes.bookmarks.update); 

// Delete the bookmark id
app.delete('/bookmark/:id', expressJwt({secret: secret.secretToken}), routes.bookmarks.delete); 

