var express = require('express');
var router = express.Router();

var Config = require('../config');
var nodegit = require('nodegit');

/**
 * GET a list of all repositories
 */
router.get('/', function(req, res, next) {
    res.json(Config.repos.map(function(repo) {
        return {name: repo.name};
    }));
});

/**
 * Performs a repository pull for the given repo
 */
router.post('/pull/:repoName', function(req, res, next) {
    var repo = Config.reposByName[req.params.repoName];
    var repoPath = repo.path;

    // Open a repository that needs to be fetched and fast-forwarded
    nodegit.Repository.open(path.resolve(__dirname, repoPath))
        .then(function(repo) {
            repository = repo;

            return repository.fetchAll({
                callbacks: {
                    credentials: function(url) {
                        return nodegit.Cred.userpassPlaintextNew(repo.username, repo.password);
                    },
                    certificateCheck: function() {
                        return 1;
                    }
                }
            });
        })
        // Now that we're finished fetching, go ahead and merge our local branch
        // with the new one
        .then(function() {
            return repository.mergeBranches("master", "origin/master");
        })
        .done(function() {
            console.log("Done!");
            res.status(200).send();
        });
});

/**
 * Performs a repository commit and push for the given repo
 */
router.post('/commit/:repoName', function(req, res, next) {
    var repoPath = Config.reposByName[req.params.repoName];
    var repository;


});

module.exports = router;
