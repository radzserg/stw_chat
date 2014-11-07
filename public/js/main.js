$(document).ready(function() {

    // need to pass this
    window.socketServerBaseUrl = 'http://localhost:3000';

    var users = [];

    (function loadUsers() {
        $.ajax({
            "type": "GET",
            "url": "/users",
            'success': function(result) {
                users = _.indexBy(result, '_id');
                renderUsers();
            }
        });
    })();

    (function login() {
        $(document).on("click", ".choose_user", function() {
            var userId = $(this).data("id");
            $.ajax({
                "type": "POST",
                "url": "/login",
                "data": {"id": userId},
                "success": function(token) {
                    renderLoggedInUser(userId);
                    window.chat.init(window.socketServerBaseUrl, userId, token);
                }
            });
        });
    })();


    (function logout() {
        $(document).on("click", ".logout", function() {
            $.removeCookie("userId");
            $.removeCookie("token");
            renderUsers();
        });
    })();

    /**
     * Re-render user list
     */
    function renderUsers() {
        $("#users").empty();
        _.each(users, function(user) {
            var userHtml = JST['user/choose'](user);
            $("#users").append(userHtml);
        });
    };

    /**
     * Render logged in user block
     * @param userId
     */
    function renderLoggedInUser(userId) {
        $("#users").empty();
        var otherUsers = _.filter(users, function(user) {
            return user.id !== userId;
        })
        var usernames = _.pluck(otherUsers, 'username');

        $("#users_title").html('Open <a href="#" target="_blank">new tab</a> and log in as other user to start chat.'
            + " Choose from: <br /><br />" + usernames.join('<br />') + '.');
        var loggedInHtml = JST['user/logged_in'](users[userId]);
        $("#logged_in_wrapper").empty().append(loggedInHtml);
    }


});