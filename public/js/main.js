$(document).ready(function() {

    // need to pass this
    window.socketServerBaseUrl = 'http://localhost:3000';

    var users = [];

    $( "#chat_index" ).draggable();

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
            $("#logged_in_wrapper").empty();
            $("#users_title").text("So choose your hero");
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
     * Just a fast way to choose another hero
     */
    $(document).on('click', '.choose-another-user', function() {
        var username = $(this).text();
        $("#chat_search_profiles").val(username).trigger('change');
        $("#chat_index").show();
    });

    /**
     * Render logged in user block
     * @param userId
     */
    function renderLoggedInUser(userId) {
        $("#users").empty();
        var otherUsersHtml = [];
        _.each(users, function(user) {
            if (user._id == userId) {
                return ;
            }
            var a = $('<a>', {href: "javascript:void(0)", "data-id": user._id, "class": 'choose-another-user'}).text(user.username);
            var t = a.prop('outerHtml');
            otherUsersHtml.push(a.prop('outerHTML'));
        });

        $("#users_title").html('Start typing username or click on user names below. ' + otherUsersHtml.join(' ')
            + ' Then open new tab, log in as chosen user and chat'
        );

        var loggedInHtml = JST['user/logged_in'](users[userId]);
        $("#logged_in_wrapper").empty().append(loggedInHtml);
    }


});