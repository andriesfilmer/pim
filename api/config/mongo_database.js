var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var secret = require('./secret');
var SALT_WORK_FACTOR = 10;
var mongodbURL = secret.mongodbURL;
var mongodbOptions = { };

mongoose.connect(mongodbURL, mongodbOptions, function (err, res) {
    if (err) { 
        console.log('Connection refused to ' + mongodbURL);
        console.log(err);
    } else {
        console.log('Mongoose connection successful ');
    }
});

var Schema = mongoose.Schema;

// User schema
var User = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    is_admin: { type: Boolean, default: false },
    created: { type: Date, default: Date.now }
});

var Post = new Schema({
    user_id: { type: String},
    title: { type: String, required: true },
    description: { type: String},
    tags: [ {type: String} ],
    is_published: { type: Boolean, default: false },
    art: { type: Boolean, default: false },
    lang: {type: String, default: 'NL'},
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    content: { type: String},
    type: {type: String, default: 'note'},
});


// Bcrypt middleware on UserSchema
User.pre('save', function(next) {
  var user = this;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
    });
  });
});

//Password verification
User.methods.comparePassword = function(password, cb) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(isMatch);
    });
};


//Define Models
var userModel = mongoose.model('User', User);
var postModel = mongoose.model('Post', Post);


// Export Models
exports.userModel = userModel;
exports.postModel = postModel;
