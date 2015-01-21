var express = require('express');
var cors = require('cors');

var config = require('./config/config.js');
var secret = require('./config/secret');

var corsOptions = { origin: config.url}; 
//var corsOptions = { origin: 'http://localhost'};    // Production
var app = express();

// Middleware that validates JsonWebTokens and set req.user.
var expressJwt = require('express-jwt');
var bodyParser = require('body-parser');

app.listen(3001);
app.use(cors(corsOptions));
app.use(bodyParser());
console.log('API is starting on port 3001');

// Enable http logging
//var morgan  = require('morgan'); 
//app.use(morgan());

// Routes
var routes = {};
routes.events = require('./route/events.js');
routes.posts = require('./route/posts.js');
routes.users = require('./route/users.js');

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

