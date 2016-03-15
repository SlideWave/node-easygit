var Config = {
    repos: [
        {name: 'Sample Repo', path: '/home/user/sample', username: 'test', password: 'test'},
        {name: 'Another Repo', path: '/home/user/another', username: 'test', password: 'test'}
    ]
};

Config.reposByName = {};
for (var i = 0, len = Config.repos.length; i < len; i++) {
    Config.reposById[Config.repos[i].name] = Config.repos[i];
}

module.exports = Config;
