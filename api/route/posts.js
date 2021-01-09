var fs = require('fs');
var moment = require('moment');
var markdownpdf = require("markdown-pdf");

var config = require('../config/config.js');
var secret = require('../config/secret');

exports.list = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  config.pool.getConnection(function(err, connection) {

    var limit = (typeof req.query.limit === 'undefined') ? 300 : parseInt(req.query.limit);
    var sql = "SELECT id as _id, title, type, tags, created, updated \
               FROM posts WHERE user_id = ? AND type LIKE ?\
               ORDER BY last_read DESC LIMIT ?";

    var query = connection.query(sql, [req.user.id, '%' + req.query.filter + '%', limit], function(err, results) {

      connection.release();

      if (err) throw err;

      return res.status(200).json(results).end(); // OK

    });
  });
};

exports.search = function(req, res) {

  var posts = req.query;
  var searchFor = '%' + req.query.searchKey + '%';

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  if (req.query.searchKey === '') {
    return res.status(411).send('Length Required').end();
  }

  if (posts.searchKey) {

    config.pool.getConnection(function(err, connection) {

      var sql = "SELECT id as _id, title, type, created , updated\
                 FROM posts WHERE (title LIKE ? OR content LIKE ? OR tags LIKE ? )\
                 AND type LIKE ? AND user_id = ?\
                 ORDER BY last_read DESC";

      var query = connection.query(sql, [searchFor, searchFor, searchFor, '%' + req.query.filter + '%', req.user.id], function(err, results) {

        connection.release();

        if (err) throw err;

        if (results.length === 0) {
          return res.status(200).json([]).end();
        }
        else {
          return res.status(200).json(results).end(); // OK
        }

      });
    });
  };
};

exports.read = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  if (!req.params.id) {
    return res.status(400).send('Bad request - id not found').end(); // Bad Request
  }

  config.pool.getConnection(function(err, connection) {

    var sql = "SELECT id as _id, title, type, tags, content, created, updated \
               FROM posts WHERE id= ? AND user_id = ? LIMIT 1";

    var query = connection.query(sql, [req.params.id, req.user.id], function(err, results) {

      var query = connection.query('UPDATE posts \
          SET times_read = times_read+1, last_read = ? \
          WHERE id = ? AND user_id = ?',
          [moment.utc().format('YYYY-MM-DD HH:mm'), req.params.id,req.user.id], function (err, results, fields) {

        if (err) {
          console.log(err);
          return res.status(400).send(err.sqlMessage).end(); // Bad Request
        }

      });

      connection.release();

      if (err) throw err;

      if (results.length === 0) {
        return res.status(404).send('Not found').end();
      }
      else {
        if (results[0].tags) { results[0].tags = JSON.parse([results[0].tags]);}
        return res.status(200).json(results[0]).end(); // OK
      }
    });
  });
};

exports.create = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  var post = req.body.post;
  if (!post) {
    res.status(400).send('Bad Request').end();
  }

  var createPost = checkPost(post);

  if (createPost.err) {
    return res.status(createPost.err).send(createPost.msg).end();
  }
  else {

    createPost.user_id = req.user.id;

    config.pool.getConnection(function(err, connection) {

      var query = connection.query('INSERT INTO posts SET ?', createPost, function (err, results, fields) {

        connection.release();

        if (err) {
          console.log(err);
          return res.status(400).send(err.sqlMessage).end(); // Bad Request
        }
        else {
          return res.status(200).send('Created post id:' + results.insertId + ' successfully').end(); // OK
        }
      });
    });
  }
}

exports.update = function(req, res) {

  if (!req.user) {
    return res.sendStatus(401); // Not authorized
  }

  var post = req.body.post;
  if (!post) {
    return res.status(400).send('Bad request').end();
  }

  if (!post._id) {
    return res.status(400).send('Bad request - id required').end();
  }

  var updatePost = checkPost(post);
  var setkeys = Object.keys(updatePost).map(item => `${item} = ?`);
  var values = Object.values(updatePost);
  values.push(post._id,req.user.id);

  config.pool.getConnection(function(err, connection) {

    var query = connection.query("UPDATE posts SET " + setkeys + " WHERE id = ? AND user_id = ?",
        values, function (err, results, fields) {

      if (err) {
        console.log(err);
        return res.status(400).send(err.sqlMessage).end(); // Bad Request
      }

    });

    var createCopy = {'org_id': post._id, 'user_id': req.user.id };
    var createVersion = Object.assign(updatePost, createCopy);
    delete createVersion.updated;

    var query = connection.query('INSERT INTO postversions SET ?', createVersion, function (err, results, fields) {

      if (err) {
        console.log(err);
        return res.status(400).send(err.sqlMessage).end(); // Bad Request
      }
      else {
        return res.status(200).send('Updated post successfully').end(); // OK
      }

    });

    connection.release();

  });
};

exports.delete = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  if (!req.params.id) {
    res.status(400).send('Bad request - Undefined id').end();
  }

  config.pool.getConnection(function(err, connection) {

    var query = connection.query("DELETE FROM posts WHERE id = ? AND user_id = ?",
        [req.params.id,req.user.id], function (err, results, fields) {

      connection.release();

      if (err) {
        console.log(err);
        return res.status(400).send(err.sqlMessage).end(); // Bad Request
      }
      else {
        console.log(moment().format('YYYY-MM-DD') + ' user: ' + req.user.id + ' deleted -> post_id: ' + req.params.id);
        var photo = config.env().upload_dir + req.user.id + "/posts/" + req.params.id + '.jpg';
        if (fs.existsSync(photo)){ fs.unlinkSync(photo); }
        return res.status(200).send('Deleted post successfully').end(); // OK
      }
    });
  });
};

exports.pdf = function(req, res) {

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  if (!req.params.id) {
    return res.sendStatus(400); // Bad Request
  }

  config.pool.getConnection(function(err, connection) {

    var sql = "SELECT id as _id, title, tags, content, created, updated \
               FROM posts WHERE id= ? AND user_id = ? LIMIT 1";

    var query = connection.query(sql, [req.params.id, req.user.id], function(err, results) {

      query = connection.query('UPDATE posts SET last_read = ? WHERE id = ? AND user_id = ?',
          [moment.utc().format('YYYY-MM-DD HH:mm'), req.params.id,req.user.id], function (err, results, fields) {

        if (err) {
          console.log(err);
          return res.status(400).send(err.sqlMessage).end(); // Bad Request
        }

      });

      connection.release();

      if (err) throw err;

      if (results.length === 0) {
        return res.status(404).send('Not found').end();
      }
      else {

        var options = { cssPath: './config/pdf.css' };
        var pathToPdf = './tmp/pdf/' + results[0].id;
        var body = '# ' + results[0].title + '\n\n' + results[0].content;
        markdownpdf(options).from.string(body).to(pathToPdf, function () {
          console.log("Created -> ", pathToPdf)
          res.download(pathToPdf);
        })
      }
    });
  });
};


exports.listVersions = function(req, res) {

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  var query = config.pool.getConnection(function(err, connection) {

    var sql = "SELECT id as _id, title, tags, created \
               FROM postversions WHERE org_id = ? AND user_id = ? ORDER BY created DESC";

    query = connection.query(sql, [req.params.id, req.user.id], function(err, results) {

      connection.release();

      if (err) throw err;

      return res.status(200).json(results).end(); // OK

    });
  });
};

exports.readVersion = function(req, res) {

  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  if (!req.params.id === '') {
    return res.sendStatus(400); // Bad Request
  }
  config.pool.getConnection(function(err, connection) {

    var sql = "SELECT id as _id, org_id, title,type, tags, content \
               FROM postversions WHERE id= ? AND user_id = ? LIMIT 1";

    var query = connection.query(sql, [req.params.id, req.user.id], function(err, results) {

      connection.release();

      if (err) throw err;

      if (results.length === 0) {
        return res.status(404).send('Not found').end();
      }
      else {
        if (results[0].tags) { results[0].tags = JSON.parse([results[0].tags]);}
        return res.status(200).json(results[0]).end(); // OK
      }
    });
  });
};

// Check values for input db.
function checkPost (post) {

  var checkedPost = {};

  if (post == null) {
    return checkedPost = { err: 400, msg: 'Bad request - No post available' };
  }

  if (post.title) {
    checkedPost.title = post.title;
  }

  if (post.content) {
    checkedPost.content = post.content;
  }

  if (post.tags) {
    checkedPost.tags = JSON.stringify(post.tags);
  }

  if (post.type) {
    checkedPost.type = post.type;
  }

  checkedPost.updated = new Date();

  return checkedPost;
}

