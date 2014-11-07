
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var logger = require('intel');

var userSchema = new Schema({
        "user_id": Number,
        "username": String,
        "auth_key": {type: String, toJSON: false},
        "online_sockets": {type: [String]},
        "created_at": { type: Date, default: Date.now },
        "updated_at": { type: Date, default: Date.now }
    }, {
        "toObject": {
            transform: function (user) {
                delete user.auth_key;
                delete user.online_sockets;
            }
        }
    }
);

if (!userSchema.options.toJSON) {
    userSchema.options.toJSON = {};
}
userSchema.options.toJSON.transform = function (doc, ret, options) {
    delete ret.auth_key;
}


/**
 * Pre save model
 */
userSchema.pre('save', function (next) {
    now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});

/**
 * Check user authorization with token
 * @param token
 * @returns {boolean}
 */
userSchema.methods.checkAuthToken = function(token) {
    /*
    I suggest to use someyhing more complex
    var hash = this.auth_key + this.username;
    var realToken = crypto.createHash('sha256')
        .update(hash, 'utf8')
        .digest();
     */
    return this.auth_key = token;
};

/**
 * Save new user's socket connection
 * @param userId
 * @param socketId
 */
userSchema.methods.online = function(socketId) {
    this.online_sockets.push(socketId);
    this.save(function (err, user) {
        if (err) {
            logger.error(err);
        }
    });
};

/**
 * Save new user's socket disconnection
 * @param userId
 * @param socketId
 */
userSchema.methods.offline = function(socketId) {
    var index = this.online_sockets.indexOf(socketId);
    if (index > -1) {
        this.online_sockets.splice(index, 1);
    }
    this.save(function (err, user) {
        if (err) {
            logger.error(err);
        }
    });

};

/**
 * Reset online sockets. i.e. Node server has been reloaded.
 */
userSchema.statics.resetOnlineSockets = function() {
    this.update({}, {"online_sockets": []}, { multi: true }, function(err, numAffected) {
        if (err) {
            return logger.error(err);
        }
    });
};

userSchema.statics.getOnlineSockets = function(userId, cb) {
    this.findOne({ "user_id": userId }, function(err, user) {
        if (err) {
            return logger.error(err);
        }

        var onlineSocket = user ? user.online_sockets : [];
        return cb(onlineSocket);
    })
}


module.exports = mongoose.model('user', userSchema);