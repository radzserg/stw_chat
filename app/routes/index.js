var express = require('express');
var router = express.Router();
var User = require('../models/user.js');

/* POST user login */
router.post('/login', function(req, res) {
    var id = req.body.id;
    User.findOne({"_id": id}, function(err, user) {
        var token = user.auth_key;    // create more complex token based on auth_key
        res.send(token);
    });
});

module.exports = router;
