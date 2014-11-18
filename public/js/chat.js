/**
 * Chat module
 * @returns {{init: init}}
 */
window.chat = (function($) {

    const DIALOG_WIDTH = 340;

    var socketBaseUrl;
    var userToken;
    var currentUserId;

    var pub = {
        init: function(baseUrl, id, token) {
            initChatConfig(baseUrl, id, token);

            var ts = (new Date).valueOf();
            $.ajax({
                url: socketBaseUrl + "/socket.io/socket.io.js?ts=" + ts,
                dataType: "script",
                success: function() {
                    if (typeof io === "undefined") {
                        console.error("Chat is inaccessible");
                    }
                    initChat();
                },
                "error": function() {
                    // if chat server is not up will try to reconnect each 60 seconds
                    window.setTimeout(function() {
                        window.chat.init();
                    }, 60000);
                }
            });
        },

        /**
         * format time in nice format
         * @param Date date
         */
        formatTime: function(date) {
            if (!date) {
                return null;
            }
            date = new Date(date);
            var now = new Date();
            var diff = (now.valueOf() - date.valueOf()) / 1000;
            if (diff < 60) {
                return moment(date).format("hh:mm:ss A");
            } else if (diff < 3600) {
                var minutesAgo = Math.ceil(diff / 60);
                return  minutesAgo > 1 ? minutesAgo + " minutes ago" : "one minute ago";
            } else if (diff < 3600 * 24) {
                var hoursAgo = Math.ceil(diff / 3600);
                return  hoursAgo > 1 ? hoursAgo + " hours ago" : "one hour ago";
            } else {
                return moment(date).format("MMMM DD hh:mm A");
            }
        }
    };

    var Chat = function(chatData) {
        var data = chatData;

        return {
            getName: function() {
                var otherUsers = this.otherUsers();
                var otherUserNames = _.pluck(otherUsers, 'username');
                return 'Chat with ' + otherUserNames.join(', ');
            },

            getUser: function(userId) {
                return _.findWhere(data.users, {"_id": userId});
            },

            isMultiChat: function() {
                return data.users.length > 2;
            },

            otherUsers: function() {
                return _.filter(data.users, function(user) {
                    return user._id != currentUserId;
                })
            }
        }
    }

    /**
     * Init config
     * @param baseUrl - socket server base url (http://[domain]:port)
     * @param id - user ID
     * @param token - authorization token for user
     */
    var initChatConfig = function(baseUrl, id, token) {
        if (typeof baseUrl !== 'undefined') {
            socketBaseUrl = baseUrl;
        } else {
            new Error("Socket server base URL must be specified");
        }
        if (typeof id !== 'undefined') {
            currentUserId = id;
        } else {
            new Error("User ID must be specified");
        }
        if (typeof token !== 'undefined') {
            userToken = token;
        } else {
            new Error("User authorization token must be specified");
        }
    }

    /**
     * Init chat
     */
    var initChat = function() {

        var socket = io(socketBaseUrl, {
            query: "id=" + currentUserId + "&token=" + userToken
        });

        var chatDialogHomeHtml = JST['chat/index']();
        $("#content").append(chatDialogHomeHtml);

        (function initChatHomePage() {
            var foundProfileTemplate = JST['chat/found_user'];

            initChatWindow($("#chat_index"));

            $("#chat_search_profiles").on("change", function() {
                var q = $(this).val();
                var $chatWindow = $("#chat_index");
                var $members = $chatWindow.find(".chat-members");
                $members.empty();

                if (q.length >= 2) {
                    socket.emit('search', q, function(users) {

                        _.each(users, function(user) {
                            var chatData = {
                                "room": null,
                                "user_id": user._id,
                                "chat_name": user.username,
                                "fileUrl": user.avatar ? "/images/avatars/" + user.avatar : null,
                                "last_message": null,
                                "last_message_time": null
                            }
                            var html = foundProfileTemplate(chatData);
                            $members.append(html);
                        });
                    });
                }
                return false;
            });

            $(document).on('keydown', '.chat_message', function(event) {
                if (event.keyCode == 13 && !event.shiftKey) {
                    $(this).closest("form").submit();
                    return false;
                }
            });
        })();

        function initChatWindow($chatWindow) {
            $chatWindow.draggable();
            $chatWindow.find('.chat-collapse').click(function(e) {
                e.preventDefault();
                var $span = $(this).find('span');
                if ($span.hasClass('glyphicon-minus')) {
                    $span.removeClass('glyphicon-minus').addClass('glyphicon-resize-full');
                } else {
                    $span.removeClass('glyphicon-resize-full').addClass('glyphicon-minus');
                }

                $(this).closest('.chat-window').toggleClass('collapsed');
            });
            $chatWindow.find('.chat-close').click(function(e) {
                e.preventDefault();
                $(this).closest('.chat-window').fadeOut();
                setTimeout(function()
                {
                    $(this).closest('.chat-window').remove();
                }, 2000)
            });
        }

        /**
         * Initiate chat with other user
         */
        $(document).on("click", '.start_chat', function() {
            var inviteUserId = $(this).data("user_id");

            socket.emit('send_invite', {"toUserId": inviteUserId}, function(chat) {
                openChat(chat);
            });
            return false;
        });

        /**
         * Get new chat message
         */
        socket.on('message', function(data) {
            openChat(data.chat, function() {
                appendMessage(data.chat, data.user_id, data.message, data.time);
            })
        });


        var contentWidth = $("#content").innerWidth();
        var dialogsPerLine = Math.floor(contentWidth / DIALOG_WIDTH) - 1;
        var chatDialogCount = 0;

        /**
         * Open new chat dialog
         * @param chat
         */
        function openChat(chat, cb) {
            var chatId = "chat_" + chat.room;
            if ($("#" + chatId).length) {
                $("#" + chatId).show();
                if (typeof cb !== 'undefined') {
                    cb();
                }
                return ;
            }

            // if we have too much dialogs then stack them
            chatDialogCount++;
            var offsetIndex = chatDialogCount;
            if (chatDialogCount > dialogsPerLine) {
                var offsetIndex = chatDialogCount % dialogsPerLine;
                offsetIndex = offsetIndex == 0 ? dialogsPerLine : offsetIndex;
                $(".chat-window-dialog.chat_offset_" + offsetIndex).remove();
            }

            var $chatWindow = $(JST['chat/dialog']({
                "id": chatId,
                "offset": offsetIndex
            }));
            $("#chat_windows").append($chatWindow);
            $chatWindow.fadeIn(1000);
            initChatWindow($chatWindow);

            $chatWindow.css("right", DIALOG_WIDTH * offsetIndex);
            $chatWindow.find(".chat_show").trigger("click");
            var $form = $chatWindow.find('form');
            var $message = $form.find("textarea");

            socket.emit("chat_info", chat.room, function(chatData) {
                var chat = Chat(chatData);

                var chatName = chat.getName();

                // $chatWindow.data("invited_profile", invitedProfile);
                $chatWindow.find(".chat-title").text(chatName);
                $chatWindow.find("textarea").focus();

                $chatWindow.show();
                // load last messages
                var lastMessages = chatData.last_messages.reverse();
                for (var i in lastMessages) {
                    var chatMessage = chatData.last_messages[i];
                    appendMessage(chatData, chatMessage.user_id, chatMessage.message, chatMessage.created_at);
                }
                if (typeof cb !== 'undefined') {
                    cb();
                }
            })

            $form.off("submit").on("submit", function(){
                socket.emit('message', {"room": chat.room, "message": $message.val()});
                $message.val('');
                return false;
            });
        }

        /**
         * Append new message
         * @param chatData
         * @param userId
         * @param message
         * @param time
         */
        function appendMessage(chatData, userId, message, time) {
            var chat = Chat(chatData);
            var messageTemplate = JST['chat/message'];
            var replyTemplate = JST['chat/reply'];

            var $chatWindow = $("#chat_" + chatData.room);
            var $chatMessages = $chatWindow.find('.chat-messages');
            if (userId != currentUserId) {
                var senderUser = chat.getUser(userId);
                var message = messageTemplate({
                    "avatar": senderUser.avatar,
                    "message": message,
                    "time": time
                });
            } else {
                var message = replyTemplate({
                    "message": message,
                    "time": time
                });
            }
            $chatMessages.append(message);
            $chatMessages.show();

            $chatMessages.animate({ scrollTop: $chatMessages[0].scrollHeight }, "slow");
        }

    }

    return pub;
})(jQuery);;

