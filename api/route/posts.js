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
        return res.send(400); // Bad Request
    }

    for (var postKey in results) {
      // In the list view we show only the first chars from content.
      results[postKey].content = results[postKey].content.substr(0, 400);
    }

    return res.status(200).json(results); // OK

  });

};

// Public function list all posts
exports.listAll = function(req, res) {

  if (!req.user) {
    return res.send(401); // Unauthorized
  }

  var query = db.postModel.find({user_id: req.user.id});

  query.select("_id title type tags created updated public");
  query.sort('-updated');
  query.exec(function(err, results) {
    if (err) {
        console.log(err);
        return res.send(400); // Bad Request
      }

      return res.status(200).json(results); // OK

  });

};

// Search all posts
exports.searchAll = function(req, res) {

  var post = req.body.post; 

  if (!req.user) {
    return res.send(401); // Unauthorized
  }

  if (post.searchKey) {
    console.log('##### post search -> ' + post.searchKey); 
    var query = db.postModel.find({ $or: [ 
                                          {title:   { $exists: true, $regex: post.searchKey, $options: 'i' } },
                                          {content: { $exists: true, $regex: post.searchKey, $options: 'i' } }, 
                                          {tags:    { $exists: true, $regex: post.searchKey, $options: 'i' } } 
                                         ],user_id: req.user.id } );
  } else {
    console.log('##### post empty search -> '); 
    var query = db.postModel.find({ user_id: req.user.id });
  }

  query.select("_id title type tags created updated public");
  query.sort('-updated');
  query.exec(function(err, results) {
    if (err) {
      console.log(err);
      return res.send(400); // Bad Request
    }

    return res.status(200).json(results); // OK

  });

};

// Show post 'id').
exports.read = function(req, res) {

  if (!req.user) {
    return res.send(401); // Unauthorized
  }

  var id = req.params.id || '';
  if (id == '') {
    return res.send(400); // Bad Request
  }

  var query = db.postModel.findOne({ _id: id, user_id: req.user.id });
  query.select('_id title tags type content created updated public');
  query.exec(function(err, result) {
    if (err) {
        console.log(err);
        return res.send(400); // Bad Request
    }

    if (result != null) {
      result.update({ $inc: { read: 1 } }, function(err, nbRows, raw) {
        return res.status(200).json(result);
      });
    } else {
      return res.send(400); // Bad Request
    }
  });
}; 

exports.create = function(req, res) {

  if (!req.user) {
    return res.send(401); // Unauthorized
  }
  console.log('##### user_id -> ' + req.user.id); 

  var post = req.body.post;
  if (post == null || post.title == null ) {
    return res.send(400); // Bad Request
  }

  var postEntry = new db.postModel();
  postEntry.user_id = req.user.id;
  postEntry.title = post.title;

  //postEntry.tags = post.tags.split(',');
  if (post.tags != null) {
    if (Object.prototype.toString.call(post.tags) === '[object Array]') {
      postEntry.tags = post.tags;
    }
    else {
      postEntry.tags = post.tags.split(',');
    }
  }

  postEntry.public = post.public;
  postEntry.content = post.content;

  postEntry.save(function(err) {
    if (err) {
      console.log(err);
      return res.send(400);
    }

    return res.status(200).end();

  });
}

exports.update = function(req, res) {

  if (!req.user) {
    return res.send(401);
  }

  var post = req.body.post;

  if (post == null || post._id == null) {
    res.send(400);
  }

  var updatePost = {};

  if (post.title != null && post.title != "") {
    updatePost.title = post.title;
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

  db.postModel.update({_id: post._id}, updatePost, function(err, nbRows, raw) {
    return res.status(200).end();
  });
};

exports.delete = function(req, res) {

  if (!req.user) {
    return res.send(401);
  }

  var id = req.params.id;
  if (id == null || id == '') {
    res.send(400);
  }

  var query = db.postModel.findOne({_id:id});

  query.exec(function(err, result) {
    if (err) {
      console.log(err);
      return res.send(400);
    }

    if (result != null) {
      result.remove();
      return res.status(200).end();
      console.log('Post -> delete'); 
    }
    else {
      return res.send(400);
    }

  });
};

exports.listByTag = function(req, res) {

  var tagName = req.params.tagName || '';
  if (tagName == '') {
    return res.send(400);
  }

  var query = db.postModel.find({tags: tagName, public: true, user_id: req.user.id });
  query.select('_id title tags type created updated public');
  query.sort('-created');
  query.exec(function(err, results) {
    if (err) {
      console.log(err);
      return res.send(400);
    }

    for (var postKey in results) {
      results[postKey].content = results[postKey].content.substr(0, 400);
    }

    return res.status(200).json(result);
  });
}

