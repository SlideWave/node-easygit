var RepoLine = React.createClass({
    render: function() {
        return (
            <ReactBootstrap.Row>
                <ReactBootstrap.Col xs={12} sm={6}>
                    {this.props.project}
                </ReactBootstrap.Col>
                <ReactBootstrap.Col xs={12} sm={3}>
                    <ReactBootstrap.Button>Commit/Push</ReactBootstrap.Button>
                </ReactBootstrap.Col>
                <ReactBootstrap.Col xs={12} sm={3}>
                    <ReactBootstrap.Button>Pull</ReactBootstrap.Button>
                </ReactBootstrap.Col>
            </ReactBootstrap.Row>
        );
    }
});

var RepoList = React.createClass({
    getInitialState: function() {
        return {repos: []};
    },

    componentDidMount: function() {
        this.loadReposFromServer();
    },

    render: function() {
        var repoNodes = this.state.repos.map(function(repo) {
            return (
                <RepoLine project={repo.name} key={repo.key}>

                </RepoLine>
            );
        });

        return (
            <ReactBootstrap.Panel>
                {repoNodes}
            </ReactBootstrap.Panel>
        );
    }
});

ReactDOM.render(
    <RepoList />,
    document.getElementById('content')
);