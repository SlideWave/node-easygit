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
                    <ReactBootstrap.Button onClick={this.props.commitClick}>Commit/Push</ReactBootstrap.Button>
                </ReactBootstrap.Col>
                <ReactBootstrap.Col xs={12} sm={3}>
                    <ReactBootstrap.Button onClick={this.props.pullClick}>Pull</ReactBootstrap.Button>
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

    onPullClick: function(repoName) {
        $.ajax({
            url: this.props.pullUrl + '/' + encodeURIComponent(repoName),
            type: 'post',
            dataType: 'json',
            cache: false,
            success: function(data) {

            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.geturl, status, err.toString());
            }.bind(this)
        });
    },

    onCommitClick: function(repoName) {

    },

    render: function() {
        var opc = this.onPullClick;
        var occ = this.onCommitClick;

        var repoNodes = this.state.repos.map(function(repo) {
            return (
                <RepoLine project={repo.name} key={repo.name}
                          pullClick={() => opc(repo.name)} commitClick={() => occ(repo.name)}>

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
    <RepoList geturl='/repos' pullUrl='/repos/pull' commitUrl='/repos/commit' />,
    document.getElementById('content')
);