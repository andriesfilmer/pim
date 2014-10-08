var express = require('express');
var cors = require('cors');
var corsOptions = { origin: 'http://localhost:3000'};
var app = express();

// Middleware that validates JsonWebTokens and set req.user.
var expressJwt = require('express-jwt');
var bodyParser = require('body-parser');
var secret = require('./config/secret');

app.listen(3001);
app.use(cors(corsOptions));
app.use(bodyParser());

// Enable logging
//
//var morgan  = require('morgan'); 
//app.use(morgan());

// Routes
var routes = {};
routes.posts = require('./route/posts.js');
routes.users = require('./route/users.js');

//Get all published post
app.get('/post', routes.posts.list);

//Get all posts
app.get('/post/all', expressJwt({secret: secret.secretToken}), routes.posts.listAll);

// Get the post id
app.get('/post/:id', routes.posts.read); 

// Get posts by tag
app.get('/tag/:tagName', routes.posts.listByTag); 

// Create a new user
app.post('/user/register', routes.users.register); 

// Login
app.post('/user/signin', routes.users.signin); 

// Logout
app.get('/user/logout', routes.users.logout); 

//Create a new post
app.post('/post', expressJwt({secret: secret.secretToken}), routes.posts.create); 

//Edit the post id
app.put('/post', expressJwt({secret: secret.secretToken}), routes.posts.update); 

//Delete the post id
app.delete('/post/:id', expressJwt({secret: secret.secretToken}), routes.posts.delete); 

console.log('API is starting on port 3001');
