var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
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
        //console.log('Mongoose connection successful ');
    }
});

var Schema = mongoose.Schema;

var User = new Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    created: { type: Date, default: Date.now }
});

// mongoose-unique-validator
User.plugin(uniqueValidator);

var Event = new Schema({
    user_id: { type: String},
    title: { type: String, required: true },
    start: {type: Date},
    end: {type: Date},
    allDay: { type: String},
    description: { type: String},
    status: { type: String},
    className: { type: String, default: 'appointment'},
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    actions_id: { type: String}, // deprecated
    naw_id: { type: String},     // deprecated
    name: { type: String}        // deprecated
});

var Post = new Schema({
    user_id: { type: String},
    title: { type: String, required: true },
    description: { type: String}, // deprecated
    content: { type: String},
    tags: [ {type: String} ],
    public: { type: Boolean, default: false },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    type: {type: String, default: 'note'}
});


var Bookmark = new Schema({
    user_id: { type: String},
    title: { type: String, required: true },
    url: { type: String },
    content: { type: String},
    tags: [ {type: String} ],
    public: { type: Boolean, default: false },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    category: {type: String}
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


// Password verification
User.methods.comparePassword = function(password, cb) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(isMatch);
    });
};


// Define Models
var userModel = mongoose.model('User', User);
var eventModel = mongoose.model('Event', Event);
var postModel = mongoose.model('Post', Post);
var bookmarkModel = mongoose.model('Bookmark', Bookmark);


// Export Models
exports.userModel = userModel;
exports.eventModel = eventModel;
exports.postModel = postModel;
exports.bookmarkModel = bookmarkModel;

