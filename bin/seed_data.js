/**
 * Created by radzserg on 10/13/14.
 *
 * Seed test data
 */

var MongoClient = require('mongodb').MongoClient;
var Promise = require('promise');
var config = require('../app/config.json');
var uuid = require('node-uuid');

MongoClient.connect(config.mongodsn, function(err, db) {
    if (err) {
        console.error("Cannot connect to mongodb");
    }
    console.log("Connected correctly to server");

    var users = [
        {"username": "Anakin", "avatar": "anakin.jpg", "auth_key": uuid.v4()},
        {"username": "C3PO", "avatar": "c3po.png", "auth_key": uuid.v4()},
        {"username": "Chewbacca", "avatar": "chewbacca.jpg", "auth_key": uuid.v4()},
        {"username": "jabba", "avatar": "jabba.png", "auth_key": uuid.v4()},
        {"username": "Kenobi", "avatar": "kenobi.png", "auth_key": uuid.v4()},
        {"username": "R2D2", "avatar": "r2d2.jpg", "auth_key": uuid.v4()},
        {"username": "yoda", "avatar": "yoda.jpg", "auth_key": uuid.v4()}
    ];

    var userCollection = db.collection('users');
    userCollection.drop();

    var insertProfiles = new Promise(function (resolve, reject) {
        userCollection.insert(users, function(err, users) {
            if (err) {
                reject(err);
            } else {
                resolve(users);
            }
        })
    });

    var chats = [];
    var chatCollection = db.collection('chats');
    chatCollection.drop();
    /**
    var insertChats = new Promise(function (resolve, reject) {
        chatCollection.insert(chats, function(err, chats) {
            if (err) {
                reject(err);
            } else {
                resolve(chats);
            }
        })
    });
    */

    var chatMessagesCollection = db.collection('chat_messages');
    chatMessagesCollection.drop();

    Promise.all([insertProfiles]).done(function (results) {
        console.log("Seed data has been successfully loaded");
        db.close();
        process.exit();
    }, function (err) {
        console.error(err);
    });
});

