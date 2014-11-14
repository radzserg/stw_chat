/**
 * Chat module
 * @returns {{init: init}}
 */
window.chat = (function($) {

    const DIALOG_WIDTH = 340;

    var socketBaseUrl;
    var userToken;
    var userId;

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
            userId = id;
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
            query: "id=" + userId + "&token=" + userToken
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
            })
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

            socket.emit('send_invite', {
                "toUserId": inviteUserId
            });
            return false;
        });

        /**
         * Someone invites us to chat. Send confirmation that invite received.
         */
        socket.on('start_chat', function(chat) {
            openChat(chat);
        });

        /**
         * Get new chat message
         */
        socket.on('message', function(data) {
            appendMessage(data.room, data.user_id, data.message, data.time);
        });


        var contentWidth = $("#content").innerWidth();
        var dialogsPerLine = Math.floor(contentWidth / DIALOG_WIDTH) - 1;
        var chatDialogCount = 0;

        /**
         * Open new chat dialog
         * @param chat
         */
        function openChat(chat) {
            var chatId = "chat_" + chat.room;
            if ($("#" + chatId).length) {
                $("#" + chatId).show();
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

            socket.emit("chat_info", chat.room, function(chat) {
                // next step
                var profiles = chat.profiles;
                var invitedProfile;
                for (var i in profiles) {
                    if (profiles[i].profile_id != currentProfileId) {
                        // considering that we have 2 chat members
                        invitedProfile = profiles[i];
                        break;
                    }
                }
                var chatName = chat.name ? chat.name : invitedProfile.username;
                $chatWindow.data("invited_profile", invitedProfile);
                $chatWindow.find(".chat-title").text(chatName);
                $chatWindow.find("textarea").focus();

                $chatWindow.show();
                // load last messages
                var lastMessages = chat.last_messages.reverse();
                for (var i in lastMessages) {
                    var chatMessage = chat.last_messages[i];
                    appendMessage(chat.room, chatMessage.profile_id, chatMessage.message, chatMessage.created_at);
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
         * @param room
         * @param profileId
         * @param message
         * @param time
         */
        function appendMessage(room, profileId, message, time) {
            var messageTemplate = JST['chat/message'];
            var replyTemplate = JST['chat/reply'];

            var $chatWindow = $("#chat_" + room);
            var $chatMessages = $chatWindow.find('.chat-messages');
            message = translateMessage(message);
            if (profileId != currentProfileId) {
                var profile = $chatWindow.data("invited_profile");
                var message = messageTemplate({
                    "avatar_url": profile.avatar_url,
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

