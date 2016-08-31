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
            throw error;
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
    var repoConfig = Config.reposByName[req.params.repoName];
    var repoPath = repoConfig.path;

    // Open a repository that needs to be fetched and fast-forwarded
    nodegit.Repository.open(repoPath)
        .then(function(repo) {
            repository = repo;

            return repository.fetchAll({
                callbacks: {
                    credentials: function(url) {
                        return nodegit.Cred.userpassPlaintextNew(repoConfig.username, repoConfig.password);
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
            var status = {message: error.message};
            res.status(500).json(status);
            throw error;
        });
});

/**
 * Performs a repository commit and push for the given repo
 */
router.post('/commit/:repoName', function(req, res, next) {
    var repoConfig = Config.reposByName[req.params.repoName];
    var repoPath = repoConfig.path;

    var sig = nodegit.Signature.now(repoConfig.fullname, repoConfig.email);
    var index;
    var oid;
    var files = [];

    nodegit.Repository.open(repoPath)
        .then(function(repo) {
            return repo.index()
                .then(function (idx) {
                    index = idx;
                    return repo.getStatus();
                })
                .then(function (statuses) {
                    statuses.forEach(function(file) {
                        files.push(file.path());
                    });

                    return index.addAll(files);
                })
                .then(function () {
                    return index.write();
                })
                .then(function () {
                    return index.writeTree();
                })
                .then(function(oidResult) {
                    oid = oidResult;
                    return nodegit.Reference.nameToId(repo, "HEAD");
                })
                .then(function(head) {
                    return repo.getCommit(head);
                })
                .then(function(parent) {
                    return repo.createCommit("HEAD", sig, sig, "automated commit", oid, [parent]);
                })
                .then(function() {
                    return repo.getRemote("origin");
                })
                .then(function(remote) {
                    return remote.push(["refs/heads/master:refs/heads/master"],
                    {
                        callbacks: {
                            credentials: function(url) {
                                return nodegit.Cred.userpassPlaintextNew(repoConfig.username, repoConfig.password);
                            },

                            certificateCheck: function() {
                                return 1;
                            }
                        }
                    });
                })

        })
        .done(function () {
            res.status(200).json({status: "ok"});
        }, function (error) {
            res.status(500).json({message: error.message});
            throw error;
        })
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
