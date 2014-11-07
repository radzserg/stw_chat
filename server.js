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

    /**
     * TBD
    var handshakeData = socket.request;

    var query = handshakeData._query;
    var token = query.token ? query.token : null;
    var id = query.id ? query.id : null;
    if (!id || !token) {
        next(new Error('not authorized'));
    }

    User.findOne({"profile_id": id}, function(err, profile) {
        if (err) {
            logger.error(err);
            return next(new Error('not authorized'));
        }
        if (!profile) {
            next(new Error('not authorized'));
        }

        if (profile.checkAuthToken(token)) {
            socket.profile = profile;
            next();
        } else {
            return next(new Error('not authorized'));
        }
    })
     */
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
     * Join socket to chat room
     * @param socket
     * @param room
     */
    socket.joinChatRoom = function(chat) {
        var room = chat.room;

        // skip if already in room
        var alreadyInRoom = undefined !== _.find(socket.rooms, function(socketRoom) {
            return socketRoom == room;
        })
        if (alreadyInRoom) {
            return;
        }

        socket.join(room).emit('start_chat', chat);

        Chat.findOne({'room': room }, function (err, chat) {
            if (err) {
                return logger.error(err);
            }

            socket.on('message', function(data) {
                var chatMessage = new ChatMessage({
                    chat_id: chat._id,
                    user_id: data.userId,
                    message: data.message
                });
                chatMessage.save(function (err, chatMessage) {
                    if (err) {
                        return logger.error(err);
                    }

                    io.sockets.to(chat.room).emit('message', {
                        "room": chat.room,
                        "message": data.message,
                        "time": chatMessage.created_at,
                        "userId": socket.user.id
                    });
                });
            });
        })
    };

    socket.on('disconnect', function() {
        socket.user.offline(socket.id);
    });
});


http.listen(config.port, function(){
    logger.info('listening on *:' + config.port);
});