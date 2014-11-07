
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var chatSchema = new Schema({
    "owner_user_id": Number,
    "user_ids": { type: [Number], index: true },
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
 * Get chat users
 * @param cb
 */
chatSchema.methods.getUsers = function(cb) {
    var self = this;
    var User = mongoose.model("user");
    User.find( {user_id: { $in: this.user_ids}})
        .exec(function(err, users) {
            self.users = users;
            cb(err, users);
        });
};


module.exports = mongoose.model('chat', chatSchema);