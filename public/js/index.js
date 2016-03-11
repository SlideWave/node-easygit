var RepoLine = React.createClass({
    render: function() {
        return (
            <ReactBootstrap.Row className="repoRow">
                <ReactBootstrap.Col xs={12} sm={6}>
                    <div className="repoName">
                        {this.props.project}
                    </div>
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

    loadReposFromServer: function() {
        $.ajax({
            url: this.props.geturl,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({repos: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.geturl, status, err.toString());
            }.bind(this)
        });
    },

    render: function() {
        var repoNodes = this.state.repos.map(function(repo) {
            return (
                <RepoLine project={repo.name} key={repo.name}>

                </RepoLine>
            );
        });

        return (
            <ReactBootstrap.Panel className="repoList">
                {repoNodes}
            </ReactBootstrap.Panel>
        );
    }
});

ReactDOM.render(
    <RepoList geturl='/repos' />,
    document.getElementById('content')
);