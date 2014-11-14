
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Promise = require('promise');

var ChatMessage = require('./chat_message.js');
var User = require('./user.js');


var chatSchema = new Schema({
    "owner_user_id": Schema.Types.ObjectId,
    "user_ids": { type: [Schema.Types.ObjectId], index: true },
    "room": {type: String,  index: true},
    "name": String,
    "last_message_time": Date,
    "created_at": { type: Date, default: Date.now },
    "updated_at": { type: Date, default: Date.now }
});

/**
 * Assign chat user objects
 */
chatSchema.virtual('users').set(function (users) {
    return this.virtual_users = users;
});
chatSchema.virtual('users').get(function () {
    return this.virtual_users;
});

/**
 * Is multi chat
 */
chatSchema.virtual('is_multi').get(function () {
    return this.user_ids.length > 2;
});

/**
 * Check if user is member of the chat
 * @param userId
 * @returns {boolean}
 */
chatSchema.methods.isMember = function(userId) {
    return this.user_ids.indexOf(userId.toString()) != -1;
}

/**
 * Get chat users
 * @param cb
 */
chatSchema.methods.getUsers = function(cb) {
    var self = this;
    User.find( {user_id: { $in: this.user_ids}})    // todo this.user_ids to strings
        .exec(function(err, users) {
            self.users = users;
            cb(err, users);
        });
};

/**
 * Return last chat messages
 * @param cb
 * @param limit
 */
chatSchema.methods.getLastMessages = function(cb, limit) {
    if (limit === undefined) {
        limit = 5;
    }

    var self = this;
    ChatMessage.find({"chat_id": this._id})
        .limit(limit)
        .sort("-created_at")
        .exec(function(err, messages) {
            self.last_messages = messages;
            cb(err, messages);
        });
};

/**
 * Return chat info
 * @param cb
 */
chatSchema.methods.info = function(cb) {
    var chat = this;
    var promises = [];
    promises.push(new Promise(function (resolve, reject) {
        chat.getLastMessages(function(err, messages) {
            if (err) {
                reject(err);
            } else {
                resolve(messages);
            }
        })
    }));
    promises.push(new Promise(function (resolve, reject) {
        chat.getUsers(function(err, users) {
            if (err) {
                reject(err);
            } else {
                resolve(users);
            }
        })
    }))

    Promise.all(promises).done(function(result) {
        return cb(null, chat);
    })
};

module.exports = mongoose.model('chat', chatSchema);