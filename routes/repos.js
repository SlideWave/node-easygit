var express = require('express');
var router = express.Router();

var Config = require('../config');
var nodegit = require('nodegit');

/**
 * Gets the status of a repository
 */
router.get('/status/:repoName', function(req, res, next) {
    var repo = Config.reposByName[req.params.repoName];
    var repoPath = repo.path;

    nodegit.Repository.open(repoPath)
        .then(function(repo) {
            return repo.getStatus().then(function(statuses) {
                function statusToText(status) {
                    var words = [];
                    if (status.isNew()) { words.push("NEW"); }
                    if (status.isModified()) { words.push("MODIFIED"); }
                    if (status.isTypechange()) { words.push("TYPECHANGE"); }
                    if (status.isRenamed()) { words.push("RENAMED"); }
                    if (status.isIgnored()) { words.push("IGNORED"); }
                    if (status.isConflicted()) { words.push("CONFLICT"); }

                    return words.join(" ");
                }

                var files = [];
                statuses.forEach(function(file) {
                    files.push(file.path() + " " + statusToText(file));
                });

                res.status(200).json({files: files});
            });
        }).catch(function (error) {
            res.status(500).json({error: error});
        });
});

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
            res.status(200).json(status);
        }, function (error) {
            console.log(error);
            var status = {message: error.message};
            res.status(500).json(status);
        });
});

/**
 * Performs a repository commit and push for the given repo
 */
router.post('/commit/:repoName', function(req, res, next) {

});

/**
 * Reverts all local uncommitted changes
 */
router.post('/revert/:repoName', function(req, res, next) {
    var repo = Config.reposByName[req.params.repoName];
    var repoPath = repo.path;

    nodegit.Repository.open(repoPath)
        .then(function(repo) {
            var checkoutOpts = {
                checkoutStrategy: nodegit.Checkout.STRATEGY.FORCE
            };

            return repo.checkoutBranch("master", checkoutOpts);
        })
        .done(function () {
            res.status(200).json({status: "ok"});
        }, function (error) {
            res.status(500).json({message: error.message});
            throw error;
        })
});

module.exports = router;
