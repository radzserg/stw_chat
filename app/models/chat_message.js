var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var chatMessageSchema = new Schema({
    chat_id: {type: Schema.Types.ObjectId, ref: 'Chat'},
    user_id: {type: Schema.Types.ObjectId, ref: 'User'},
    message: String,
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('chat_message', chatMessageSchema);