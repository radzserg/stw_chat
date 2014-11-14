var express = require("express")
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var uuid = require('node-uuid');
var _ = require('underscore');
var logger = require('intel');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');

var config = require('./app/config.json');
if (fs.existsSync('./app/config.local.json')) {
    var localConfig = require('./app/config.local.json');
    config = _.extend(config, localConfig);
}

logger.basicConfig({
    // "file": "/app/runtime/app.log",
    "stream": process.stdout,
    "format": "%(message)s",
    "level": config.logger.level
});

mongoose.connect(config.mongodsn);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    logger.info("Mongo connected");
});

// models
var ChatMessage = require('./app/models/chat_message.js');
var Chat = require('./app/models/chat.js');
var User = require('./app/models/user.js');

/**
 * This function init components for backend sample application
 * you don't need for chat
 */
(function initForBackend() {
    var userRoutes = require('./app/routes/users');
    var indexRoutes = require('./app/routes/index');

    var bodyParser = require('body-parser');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.use(express.static(path.join(__dirname, '/public')));
    app.use('/', indexRoutes);
    app.use('/users', userRoutes);
})();

/**
 * Authorize socket connection
 */
io.use(function(socket, next) {

    var handshakeData = socket.request;

    var query = handshakeData._query;
    var token = query.token ? query.token : null;
    var id = query.id ? query.id : null;
    if (!id || !token) {
        next(new Error('not authorized'));
    }

    User.findOne({"_id": id}, function(err, user) {
        if (err) {
            logger.error(err);
            return next(new Error('not authorized'));
        }
        if (!user) {
            return next(new Error('not authorized'));
        }

        if (user.checkAuthToken(token)) {
            socket.user = user;
            next();
        } else {
            return next(new Error('not authorized'));
        }
    })
});

// reset online sockets stat
User.resetOnlineSockets();

io.sockets.on('connection', function (socket) {

    socket.user.online(socket.id);

    /**
     * Current user invite other to chat
     */
    socket.on("send_invite", function(data) {
        var toUserId = data.toUserId;

        // sort user ids. Then we can use this condition to find chat between existed users.
        var userIds = [socket.user.id, toUserId].sort(function(a, b){return a-b});

        Chat.findOne({'user_ids': userIds }, function (err, chat) {
            if (err) {
                return logger.error(err);
            }

            if (!chat) {
                // create chat
                var chat = new Chat({
                    "room": uuid.v4(),
                    "user_ids": userIds,
                    "owner_user_id": socket.user.id
                });
                chat.save(function (err, chat) {
                    if (err) {
                        return logger.error(err);
                    }

                    startChat(chat);
                });
            } else {
                startChat(chat);
            }

            /**
             * Send to chat members event to start chat with chat room.
             * @param chat
             */
            function startChat(chat) {
                _.each(chat.user_ids, function(userId) {
                    User.getOnlineSockets(userId, function (socketIds) {
                        _.each(socketIds, function (socketId) {
                            var socket = io.sockets.connected[socketId];
                            if (socket) {
                                socket.joinChatRoom(chat);
                            }
                        })
                    });
                });
            }
        });
    });

    /**
     * Send to chat members event to start chat with chat room.
     * @param chat
     */
    var startChat = function(chat) {
        _.each(chat.user_ids, function(userId) {
            User.getOnlineSockets(userId, function (userIds) {
                _.each(userIds, function (socketId) {
                    var socket = io.sockets.connected[socketId];
                    if (socket) {
                        socket.joinChatRoom(chat);
                    }
                })
            });
        });
    };

    /**
     * Join socket to chat room
     * @param socket
     * @param room
     */
    socket.joinChatRoom = function(chat) {
        var room = chat.room;

        // if user closed chat and initiate it again - emit to client again
        socket.emit("start_chat", chat);

        // skip if already in room
        var alreadyInRoom = undefined !== _.find(socket.rooms, function(socketRoom) {
            return socketRoom == room;
        });
        if (alreadyInRoom) {
            return;
        }

        socket.join(room);
    };

    /**
     * When we get new message from socket - resend it to all members of chat room
     */
    socket.on('message', function(data) {
        var message = sanitizeHtml(data.message).trim();
        if (message == '') {
            return ;
        }
        Chat.findOne({'room': data.room }, function (err, chat) {
            if (err) {
                return logger.error(err);
            }

            if (!chat) {
                return logger.error("Chat is not found. Room ID" + data.room);
            }

            startChat(chat);

            var chatMessage = new ChatMessage({
                "chat_id": chat._id,
                "user_id": socket.user._id,
                "message": message
            });
            chatMessage.save(function (err, chatMessage) {
                if (err) {
                    return logger.error(err);
                }

                chat.last_message_time = chatMessage.created_at;
                chat.save();

                io.sockets.to(chat.room).emit('message', {
                    "room": chat.room,
                    "message": chatMessage.message,
                    "time": chatMessage.created_at,
                    "user_id": socket.user._id
                });
            });
        })
    });

    /**
     * Generic search - profiles and archived chats
     */
    socket.on("search", function(q, cb) {
        var criteria = {
            "_id": {"$ne": socket.user._id.toString()},
            "username": new RegExp(q, 'i')
        };
        User.find(criteria).limit(20).exec(function (err, users) {
            if (err) {
                return logger.error(err);
            }
            cb(users);
        });
    });

    /**
     * Return chat info
     */
    socket.on("chat_info", function(room, cb) {
        getProfileChat(room, function(chat) {
            if (!chat) {
                return cb(null);
            }
            chat.info(function(err, chat) {
                return cb(chat);
            })
        });
    });

    /**
     * Return profile chat
     * @param room
     */
    var getProfileChat = function(room, cb) {
        Chat.findOne({'room': room }, function (err, chat) {
            if (err) {
                return logger.error(err);
            }

            if (!chat) {
                return cb(null)
            }

            if (!chat.isMember(socket.user._id)) {
                return cb(null)
            }

            return cb(chat);
        })
    };

    /**
     * On disconnect
     */
    socket.on('disconnect', function() {
        socket.user.offline(socket.id);
    });
});


http.listen(config.port, function(){
    logger.info('listening on *:' + config.port);
});