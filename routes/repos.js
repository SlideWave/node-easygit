var express = require('express');
var router = express.Router();

var Config = require('../config');

/* GET a list of all repositories */
router.get('/', function(req, res, next) {
    res.json(Config.repos.map(function(repo) {
        return {name: repo.name};
    }));
});

module.exports = router;
