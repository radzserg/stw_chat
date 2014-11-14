this["JST"] = this["JST"] || {};

this["JST"]["chat/dialog"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="chat-window chat-success chat-window-dialog chat_offset_' +
((__t = ( offset )) == null ? '' : __t) +
'" id="' +
((__t = ( id )) == null ? '' : __t) +
'">\n    <div class="chat-window__inner chat">\n        <div class="chat-heading">\n            <h3>\n                <i class="icon-messages icon-header"></i><span class="chat-title"></span>\n                <a href="javascript:void(0)" class="chat-collapse">\n                    <span class="glyphicon glyphicon-minus"></span>\n                </a>\n                <a href="javascript:void(0)" class="chat-close">\n                    <span class="glyphicon glyphicon-remove"></span>\n                </a>\n            </h3>\n        </div>\n        <div class="chat-content__inner">\n            <div class="chat-control">\n                <a href="" class="chat-adjust icon-sub-header left chat_options_show">\n                    <i class="icon-list2"></i>\n                </a>\n            </div>\n            <div class="chat-body">\n                <div class="chat-messages">\n\n                </div>\n                <div class="reply-form__wrapper">\n                    <div class="reply-form">\n                        <form action="" class="chat-message-form">\n                            <textarea name="" class="chat_message" cols="30" rows="10" placeholder=" Send a message..."></textarea>\n                        </form>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>';

}
return __p
};

this["JST"]["chat/found_user"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="member clearfix start_chat" data-user_id="' +
((__t = ( user_id )) == null ? '' : __t) +
'">\n    <div class="member-inner clearfix">\n        ';
 if (fileUrl) { ;
__p += '\n            <div class="user-img chat_avatar">\n                <img src="' +
((__t = ( fileUrl )) == null ? '' : __t) +
'" alt="" />\n            </div>\n        ';
 } ;
__p += '\n        <div class="member-content">\n            <h3>' +
((__t = ( chat_name )) == null ? '' : __t) +
'</h3>\n\n            <article class="status">' +
((__t = ( last_message )) == null ? '' : __t) +
'</article>\n        </div>\n\n        <div class="time">' +
((__t = ( last_message_time )) == null ? '' : __t) +
'</div>\n\n    </div>\n</div>';

}
return __p
};

this["JST"]["chat/index"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="chat-window chat-default" id="chat_index">\n\n    <div class="chat-window-inner" data-window="chat_home">\n        <div class="chat-heading success-heading">\n            <h3>\n                <i class="icon-upload2 icon-header"></i>Chat\n                <a href="javascript:void(0)" class="chat-collapse">\n                    <span class="glyphicon glyphicon-minus"></span>\n                </a>\n                <a href="javascript:void(0)" class="chat-close">\n                    <span class="glyphicon glyphicon-remove"></span>\n                </a>\n            </h3>\n        </div>\n        <div class="chat-content-inner">\n            <div class="chat-control">\n                <a class="chat-back icon-sub-header left icon-search">\n                    <span class="glyphicon glyphicon-search"></span>\n                </a>\n                <div class="chat-search archive icon-sub-header">\n                    <input type="text" placeholder="Search Members" id="chat_search_profiles"/>\n                </div>\n\n                <!--\n                <a href="javascript:void(0)" class="chat-settings icon-sub-header right chat_settings_show">\n                    <span class="glyphicon glyphicon-wrench"></span>\n                </a>\n                -->\n            </div>\n            <div class="chat-body">\n                <div class="chat-members">\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n\n<div id="chat_windows">\n\n</div>\n';

}
return __p
};

this["JST"]["chat/message"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="message clearfix">\n    <div class="message-inner clearfix">\n        ';
 if (avatar_url) { ;
__p += '\n        <div class="user-img">\n            <img src="/images/avatars/' +
((__t = ( avatar )) == null ? '' : __t) +
'" alt="" />\n        </div>\n        ';
 } ;
__p += '\n        <div class="message-content__wrapper">\n            <div class="message-content">\n                ' +
((__t = ( message )) == null ? '' : __t) +
'\n            </div>\n            <ins class="time">' +
((__t = ( chat.formatTime(time) )) == null ? '' : __t) +
'</ins>\n        </div>\n    </div>\n</div>\n';

}
return __p
};

this["JST"]["chat/reply"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="reply">\n    <div class="reply-content__wrapper clearfix">\n        <div class="reply-content">\n            ' +
((__t = ( message )) == null ? '' : __t) +
'\n        </div>\n    </div>\n    <ins class="time">' +
((__t = ( chat.formatTime(time) )) == null ? '' : __t) +
'</ins>\n</div>';

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