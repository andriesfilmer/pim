var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

var secret = require('../config/secret');
var db = require('../config/mongo_database');

// List published posts
exports.listPublic = function(req, res) {

  var query = db.postModel.find({public: true, user_id: req.user.id });
  query.sort('-created');
  query.exec(function(err, results) {
    if (err) {
        console.log(err);
        return res.sendStatus(400); // Bad Request
    }

    for (var postKey in results) {
      // In the list view we show only the first chars from content.
      results[postKey].content = results[postKey].content.substr(0, 400);
    }

    if (result !== null) {
      return res.status(200).json(results); // OK
    }
    else {
      return res.sendStatus(404); // Not Found
    }

  });

};

// Public function list all posts
exports.list = function(req, res) {

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  var query = db.postModel.find({user_id: req.user.id}).limit(req.query.limit);

  query.select("_id title type tags created updated public");
  query.sort('-updated');
  query.exec(function(err, results) {

    if (err) {
      console.log(err);
      return res.sendStatus(400); // Bad Request
    }

    //if (results !== null) {
      return res.status(200).json(results); // OK
    //}
    //else {
    //  return res.sendStatus(404); // Not Found
    //}

  });

};

// Search all posts
exports.search = function(req, res) {

  var posts = req.query; 

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  if (posts.searchKey) {
    //console.log('Post search -> ' + posts.searchKey); 
    var query = db.postModel.find({ $or: [ 
                                          {title:   { $exists: true, $regex: posts.searchKey, $options: 'i' } },
                                          {content: { $exists: true, $regex: posts.searchKey, $options: 'i' } }, 
                                          {tags:    { $exists: true, $regex: posts.searchKey, $options: 'i' } } 
                                         ],user_id: req.user.id } );
  } else {
    //console.log('Post empty search -> Show all'); 
    var query = db.postModel.find({ user_id: req.user.id });
  }

  query.select("_id title type tags created updated public");
  query.sort('-updated');
  query.exec(function(err, results) {

    if (err) {
      console.log(err);
      return res.sendStatus(400); // Bad Request
    }

    if (results !== null) {
      return res.status(200).json(results); // OK
    }
    else {
      return res.sendStatus(404); // Not Found
    }

  });

};

// Show post id.
exports.read = function(req, res) {

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  var id = req.params.id || '';
  if (id === '') {
    return res.sendStatus(400); // Bad Request
  }

  var query = db.postModel.findOne({ _id: id, user_id: req.user.id });
  query.select('_id title tags type content created updated public');
  query.exec(function(err, result) {

    if (err) {
        console.log(err);
        return res.sendStatus(400); // Bad Request
    }

    if (result != null) {
      result.update({ $inc: { read: 1 } }, function(err, nbRows, raw) {
        return res.status(200).json(result);
      });
    }
    else {
      return res.sendStatus(400); // Bad Request
    }

  });
}; 

exports.create = function(req, res) {

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  var post = req.body.post;
  if (post == null) {
    return res.sendStatus(400); // Bad Request
  }

  var postEntry = new db.postModel();

  postEntry.user_id = req.user.id;

  // Title required
  if (post.title !== null && post.title !== "") {
    postEntry.title = post.title;
  }
  else {
    return res.sendStatus(400); // Bad Request
  }

  postEntry.public = post.public;
  postEntry.content = post.content;

  if (post.tags != null) {
    if (Object.prototype.toString.call(post.tags) === '[object Array]') {
      postEntry.tags = post.tags;
    }
    else {
      postEntry.tags = post.tags.split(',');
    }
  }

  postEntry.save(function(err) {
    if (err) {
      console.log(err);
      return res.sendStatus(400);
    }

    return res.sendStatus(200).end();

  });
}

exports.update = function(req, res) {

  if (!req.user) {
    return res.send(401); // Not authorized
  }

  var post = req.body.post;
  if (post == null) {
    res.send(400);
  }

  var updatePost = {};

  // id required
  if (post._id === null || post._id === "" || post._id === undefined) {
    return res.sendStatus(400); // Bad Request
  }

  // Title required
  if (post.title !== null && post.title !== "") {
    updatePost.title = post.title;
  }
  else {
    return res.sendStatus(400); // Bad Request
  }

  if (post.tags != null) {
    if (Object.prototype.toString.call(post.tags) === '[object Array]') {
      updatePost.tags = post.tags;
    }
    else {
      updatePost.tags = post.tags.split(',');
    }
  }

  if (post.type != null) {
    updatePost.type = post.type;
  }

  if (post.public != null) {
    updatePost.public = post.public;
  }

  if (post.content != null && post.content != "") {
    updatePost.content = post.content;
  }

  updatePost.updated = new Date();

  db.postModel.update({_id: post._id, user_id: req.user.id}, updatePost, function(err, nbRows, raw) {
    return res.status(200).end();
  });
};

exports.delete = function(req, res) {

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  var id = req.params.id;
  if (id == null || id == '') {
    res.sendStatus(400); // Bad request
  }

  var query = db.postModel.findOne({_id:id});

  query.exec(function(err, result) {
    if (err) {
      console.log(err);
      return res.sendStatus(400); // Bad request
    }

    if (result != null) {
      result.remove();
      return res.sendStatus(200).end();
      console.log('Post -> delete'); 
    }
    else {
      return res.sendStatus(404); // Not Found
    }

  });
};

exports.listByTag = function(req, res) {

  var tagName = req.params.tagName || '';
  if (tagName == '') {
    return res.sendStatus(400);
  }

  var query = db.postModel.find({tags: tagName, public: true, user_id: req.user.id });
  query.select('_id title tags type created updated public');
  query.sort('-created');
  query.exec(function(err, results) {
    if (err) {
      console.log(err);
      return res.sendStatus(400);
    }

    for (var postKey in results) {
      results[postKey].content = results[postKey].content.substr(0, 400);
    }

    return res.status(200).json(result);
  });
}

