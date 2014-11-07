var express = require('express');
var router = express.Router();
var User = require('../models/user.js');


/* GET users listing */
router.get('/', function(req, res) {
    User.find({}, function(err, users) {
        res.send(users);
    });
});

/* POST users login */
router.get('/login', function(req, res) {
    var t = 12;
    /*
    User.find({}, function(err, users) {
        res.send(users);
    });*/
    res.send({"q":12});
});

module.exports = router;
