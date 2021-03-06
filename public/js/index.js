var RepoLine = React.createClass({
    render: function() {
        return (
            <ReactBootstrap.Row className="repoRow">
                <ReactBootstrap.Col xs={12} sm={4}>
                    <div className="repoName">
                        {this.props.project}
                    </div>
                </ReactBootstrap.Col>
                <ReactBootstrap.Col xs={3} sm={2}>
                    <ReactBootstrap.Button onClick={this.props.statusClick}>Status</ReactBootstrap.Button>
                </ReactBootstrap.Col>
                <ReactBootstrap.Col xs={3} sm={2}>
                    <ReactBootstrap.Button bsStyle="primary" onClick={this.props.commitClick}>Commit</ReactBootstrap.Button>
                </ReactBootstrap.Col>
                <ReactBootstrap.Col xs={3} sm={2}>
                    <ReactBootstrap.Button bsStyle="primary" onClick={this.props.pullClick}>Pull</ReactBootstrap.Button>
                </ReactBootstrap.Col>
                <ReactBootstrap.Col xs={3} sm={2}>
                    <ReactBootstrap.Button bsStyle="danger" onClick={this.props.revertClick}>Revert</ReactBootstrap.Button>
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
                this.props.showModal("Error", err.toString());
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
                this.props.showModal("Pull Complete", data.oid);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.geturl, status, err.toString());
                this.props.showModal("Error", err.toString());
            }.bind(this)
        });
    },

    onCommitClick: function(repoName) {
        $.ajax({
            url: this.props.commitUrl + '/' + encodeURIComponent(repoName),
            type: 'post',
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.props.showModal("Files", "Changes committed and pushed");
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.geturl, status, err.toString());
                this.props.showModal("Error", err.toString());
            }.bind(this)
        });
    },

    onStatusClick: function(repoName) {
        $.ajax({
            url: this.props.statusUrl + '/' + encodeURIComponent(repoName),
            type: 'get',
            dataType: 'json',
            cache: false,
            success: function(data) {
                var status;

                if (data.files.length > 0) status = data.files.join("<br>");
                else status = "All up to date";

                this.props.showModal("Files", status);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.geturl, status, err.toString());
                this.props.showModal("Error", err.toString());
            }.bind(this)
        });
    },

    onRevertClick: function(repoName) {
        var ans = confirm("About to revert all local changes");

        if (ans) {
            $.ajax({
                url: this.props.revertUrl + '/' + encodeURIComponent(repoName),
                type: 'post',
                dataType: 'json',
                cache: false,
                success: function(data) {
                    this.props.showModal("Reverted", "Changes were reverted");
                }.bind(this),
                error: function(xhr, status, err) {
                    console.error(this.props.geturl, status, err.toString());
                    this.props.showModal("Error", err.toString());
                }.bind(this)
            });
        }
    },

    render: function() {
        var opc = this.onPullClick;
        var occ = this.onCommitClick;
        var osc = this.onStatusClick;
        var orc = this.onRevertClick;

        var repoNodes = this.state.repos.map(function(repo) {
            return (
                <RepoLine project={repo.name} key={repo.name}
                          pullClick={() => opc(repo.name)}
                          commitClick={() => occ(repo.name)}
                          statusClick={() => osc(repo.name)}
                          revertClick={() => orc(repo.name)}>

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

var StatusModal = React.createClass({
    render() {
        return (
            <ReactBootstrap.Modal show={this.props.showModal} onHide={this.props.onClose}
                                  aria-labelledby="contained-modal-title-sm">
                <ReactBootstrap.Modal.Header closeButton>
                    <ReactBootstrap.Modal.Title id="contained-modal-title-sm">Status</ReactBootstrap.Modal.Title>
                </ReactBootstrap.Modal.Header>
                <ReactBootstrap.Modal.Body>
                    <h4>{this.props.header}</h4>
                    <p>{this.props.content}</p>
                 </ReactBootstrap.Modal.Body>
                <ReactBootstrap.Modal.Footer>
                    <ReactBootstrap.Button onClick={this.props.onClose}>Close</ReactBootstrap.Button>
                </ReactBootstrap.Modal.Footer>
            </ReactBootstrap.Modal>
        );
    }
});

const App = React.createClass({
    getInitialState() {
        return { modalShow: false, modalTitle: '', modalText: '' };
    },

    showModal(title, text) {
        this.setState({modalShow: true, modalTitle: title, modalText: text})
    },

    render() {
        let modalClose = () => this.setState({modalShow: false});
        let doShowModal = (t, txt) => this.showModal(t, txt);

        return (
            <div class="container">
                <StatusModal showModal={this.state.modalShow} header={this.state.modalTitle}
                    content={this.state.modalText} onClose={modalClose} />
                <RepoList geturl='/repos' pullUrl='/repos/pull' commitUrl='/repos/commit'
                    statusUrl='/repos/status' revertUrl='/repos/revert' showModal={doShowModal} />
            </div>
        );
    }
});

ReactDOM.render(
    <App />,
    document.getElementById('content')
);