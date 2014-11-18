var express = require('express');
var cors = require('cors');
var corsOptions = { origin: 'http://pim.filmer.nl'};
var app = express();

// Middleware that validates JsonWebTokens and set req.user.
var expressJwt = require('express-jwt');
var bodyParser = require('body-parser');
var secret = require('./config/secret');

app.listen(3001);
app.use(cors(corsOptions));
//app.use(cors());
app.use(bodyParser());

// Enable http logging
//var morgan  = require('morgan'); 
//app.use(morgan());

// Routes
var routes = {};
routes.posts = require('./route/posts.js');
routes.users = require('./route/users.js');

// Create a new user
app.post('/user/register', routes.users.register); 

// Login
app.post('/user/signin', routes.users.signin); 

// Logout
app.get('/user/logout', routes.users.logout); 

// Get posts by tag
app.get('/tag/:tagName', routes.posts.listByTag); 

//Get all posts
app.get('/post/public', routes.posts.listPublic);

//Get all published post
app.get('/post', expressJwt({secret: secret.secretToken}), routes.posts.listAll);

// Get the post id
app.get('/post/:id', expressJwt({secret: secret.secretToken}), routes.posts.read); 

//Create a new post
app.post('/post', expressJwt({secret: secret.secretToken}), routes.posts.create); 

//Edit the post id
app.put('/post', expressJwt({secret: secret.secretToken}), routes.posts.update); 

//Delete the post id
app.delete('/post/:id', expressJwt({secret: secret.secretToken}), routes.posts.delete); 

console.log('API is starting on port 3001');
