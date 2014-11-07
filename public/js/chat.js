/**
 * Chat module
 * @returns {{init: init}}
 */
window.chat = (function($) {

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
    }

    return pub;
})(jQuery);;

