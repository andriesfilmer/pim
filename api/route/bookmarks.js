var moment = require('moment');
var fs = require('fs');

var secret = require('../config/secret');
var config = require('../config/config.js');

exports.list = function(req, res) {

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  config.pool.getConnection(function(err, connection) {

    req.query.order === 'title' ? order = 'title' : order = 'last_read';

    var limit = (typeof req.query.limit === 'undefined') ? 300 : parseInt(req.query.limit);

    var sql = "SELECT id as _id, title, url, category, tags, created, updated \
               FROM bookmarks WHERE user_id = ? ORDER BY " + order + " DESC limit ?";

    var query = connection.query(sql, [req.user.id, limit], function(err, results) {

      connection.release();

      if (err) throw err;

      return res.status(200).json(results).end(); // OK

    });
  });
};


exports.search = function(req, res) {

  var bookmarks = req.query;
  var searchFor = '%' + req.query.searchKey + '%';

  if (!req.user) {
    return res.status(401).send('Unauthorized').end();
  }

  if (req.query.searchKey === '') {
    return res.status(204).send('No content').end();
  }

  if (bookmarks.searchKey) {

    req.query.order === 'name' ? order = 'name' : order = 'last_read';

    // list all bookmarks.
    var query = config.pool.getConnection(function(err, connection) {

      var sql = "SELECT id as _id, title, created , updated\
                 FROM bookmarks WHERE (title LIKE ? \
                 OR content LIKE ? \
                 OR url LIKE ? \
                 OR tags LIKE ? )\
                 AND user_id = ? \
                 ORDER BY ?";

      var query = connection.query(sql, [searchFor, searchFor, searchFor, searchFor, req.user.id, order], function(err, results) {

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

    var sql = "SELECT id as _id, title, url,category, content, tags, created, updated \
               FROM bookmarks WHERE id= ? AND user_id = ? LIMIT 1";

    var query = connection.query(sql, [req.params.id, req.user.id], function(err, results) {

      var query = connection.query('UPDATE bookmarks \
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

  var bookmark = req.body.bookmark;
  if (!bookmark) {
    res.status(400).send('Bad Request').end();
  }

  var createBookmark = checkBookmark(bookmark);

  if (createBookmark.err) {
    return res.status(createBookmark.err).send(createBookmark.msg).end();
  }
  else {

    createBookmark.user_id = req.user.id;

    config.pool.getConnection(function(err, connection) {

      var query = connection.query('INSERT INTO bookmarks SET ?', createBookmark, function (err, results, fields) {

        connection.release();

        if (err) {
          console.log(err);
          return res.status(400).send(err.sqlMessage).end(); // Bad Request
        }
        else {
          return res.status(200).send('Created bookmark id:' + results.insertId + ' successfully').end(); // OK
        }
      });
    });
  }
}

exports.update = function(req, res) {

  if (!req.user) {
    return res.sendStatus(401); // Not authorized
  }

  var bookmark = req.body.bookmark;
  if (!bookmark) {
    return res.status(400).send('Bad request').end();
  }

  if (!bookmark._id) {
    return res.status(400).send('Bad request - id required').end();
  }

  var updateBookmark = checkBookmark(bookmark);
  console.dir(updateBookmark);
  var setkeys = Object.keys(updateBookmark).map(item => `${item} = ?`);
  var values = Object.values(updateBookmark);
  values.push(bookmark._id,req.user.id);

  config.pool.getConnection(function(err, connection) {

    var query = connection.query("UPDATE bookmarks SET " + setkeys + " WHERE id = ? AND user_id = ?",
        values, function (err, results, fields) {

      connection.release();

      if (err) {
        console.log(err);
        return res.status(400).send(err.sqlMessage).end(); // Bad Request
      }
      else {
        return res.status(200).send('Updated bookmark successfully').end(); // OK
      }

    });

    console.log("######## query.sql: " + query.sql);

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

    var query = connection.query("DELETE FROM bookmarks WHERE id = ? AND user_id = ?",
        [req.params.id,req.user.id], function (err, results, fields) {

      connection.release();

      if (err) {
        console.log(err);
        return res.status(400).send(err.sqlMessage).end(); // Bad Request
      }
      else {
        console.log(moment().format('YYYY-MM-DD') + ' user: ' + req.user.id + ' deleted -> bookmark_id: ' + req.params.id);
        var photo = config.env().upload_dir + req.user.id + "/bookmarks/" + req.params.id + '.jpg';
        if (fs.existsSync(photo)){ fs.unlinkSync(photo); }
        return res.status(200).send('Deleted bookmark successfully').end(); // OK
      }
    });
  });
};

// Check values for input db.
function checkBookmark (bookmark) {

  var checkedBookmark = {};

  if (bookmark == null) {
    return checkedBookmark = { err: 400, msg: 'Bad request - No bookmark available' };
  }

  if (bookmark.title) {
    checkedBookmark.title = bookmark.title;
  }

  if (bookmark.url) {
    checkedBookmark.url = bookmark.url;
  }

  if (bookmark.content) {
    checkedBookmark.content = bookmark.content;
  }

  if (bookmark.category) {
    checkedBookmark.category = bookmark.category;
  }

  if (bookmark.tags) {
    checkedBookmark.tags = JSON.stringify(bookmark.tags);
  }

  checkedBookmark.updated = new Date();

  return checkedBookmark;
}

