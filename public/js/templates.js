this["JST"] = this["JST"] || {};

this["JST"]["chat/index"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="chat-window chat-default" id="chat_index">\n\n    <div class="chat-window-inner" data-window="chat_home">\n        <div class="chat-heading success-heading">\n            <h3>\n                <i class="icon-upload2 icon-header"></i>Chat\n                <a href="javascript:void(0)" class="chat-collapse">\n                    <span class="glyphicon glyphicon-minus"></span>\n                </a>\n                <a href="javascript:void(0)" class="chat-close">\n                    <span class="glyphicon glyphicon-remove"></span>\n                </a>\n            </h3>\n        </div>\n        <div class="chat-content-inner">\n            <div class="chat-control">\n                <a class="chat-back icon-sub-header left icon-search">\n                    <span class="glyphicon glyphicon-search"></span>\n                </a>\n                <div class="chat-search archive icon-sub-header">\n                    <input type="text" placeholder="Search Members" id="chat_search_profiles"/>\n                </div>\n\n                <a href="javascript:void(0)" class="chat-settings icon-sub-header right chat_settings_show">\n                    <span class="glyphicon glyphicon-wrench"></span>\n                </a>\n            </div>\n            <div class="chat-body">\n                <div class="chat-members">\n\n\n                </div>\n            </div>\n        </div>\n    </div>\n    <!-- Settings -->\n</div>\n\n\n<div id="chat_windows">\n\n</div>\n\n<div class="display-none">\n    <audio id="chat_sound">\n        <source src="/audio/chat_incoming.wav" type="audio/wav">\n    </audio>\n</div>';

}
return __p
};

this["JST"]["user/choose"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="col-md-2 choose_user" data-id="' +
((__t = ( _id )) == null ? '' : __t) +
'">\n    <a href="javascript:void(0)" class="avatar">\n        <img src="/images/avatars/' +
((__t = ( avatar )) == null ? '' : __t) +
'">\n        <p>' +
((__t = ( username )) == null ? '' : __t) +
'</p>\n    </a>\n</div>';

}
return __p
};

this["JST"]["user/logged_in"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="navbar-form navbar-right logged-user">\n    <div class="username_wrapper">\n        <div class="username">' +
((__t = ( username )) == null ? '' : __t) +
'</div>\n        <div>\n            <a href="javascript:void(0)" class="logout">\n                <span class="glyphicon glyphicon-log-out"></span> Logout\n            </a>\n        </div>\n    </div>\n\n    <img src="/images/avatars/' +
((__t = ( avatar )) == null ? '' : __t) +
'">\n</div>';

}
return __p
};