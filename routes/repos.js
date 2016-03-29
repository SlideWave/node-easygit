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
    nodegit.Repository.open(repoPath)
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

        .done(function(oid) {
            var status = {oid: oid};
            res.status(200).send(status);
        }, function (error) {
            console.log(error);
            var status = {message: error.message};
            res.status(500).send(status);
        });
});

/**
 * Performs a repository commit and push for the given repo
 */
router.post('/commit/:repoName', function(req, res, next) {
    var repoPath = Config.reposByName[req.params.repoName];
    var repository;


});

/**
 * Gets the status of a repository
 */
router.get('/status/:repoName', function(req, res, next) {
    var repoPath = Config.reposByName[req.params.repoName];
    var repository;

    nodegit.Repository.open(repoPath)
        .then(function(repo) {
            repo.getStatus().then(function(statuses) {
                function statusToText(status) {
                    var words = [];
                    if (status.isNew()) { words.push("NEW"); }
                    if (status.isModified()) { words.push("MODIFIED"); }
                    if (status.isTypechange()) { words.push("TYPECHANGE"); }
                    if (status.isRenamed()) { words.push("RENAMED"); }
                    if (status.isIgnored()) { words.push("IGNORED"); }

                    return words.join(" ");
                }

                statuses.forEach(function(file) {
                    console.log(file.path() + " " + statusToText(file));
                });
            });
        });
});

module.exports = router;
