import React, { Component } from 'react';
import { getProjectAllFiles } from '../../api/projects-api';

import './AppMain.css';
import AppWorkspace from '../AppWorkspace/AppWorkspace';
import StatusBar from '../StatusBar/StatusBar';

class AppMain extends Component {
    constructor(props) {
        super(props);

        this.state = {
            projectId: this.props.params.projectId,
            projectType: null,
            workspace: {
                files: [],
                activeFile: null
            }
        };
    }

    componentWillMount() {
        // TODO call getProjectInfo, which should return a snapshot
        getProjectAllFiles(this.state.projectId)
            .then((response) => {
                response.json().then((projFiles) => {
                    var currWorkspace = this.state.workspace;
                    currWorkspace.files = projFiles;
                    this.setState({
                        workspace: currWorkspace
                    });
                })
                .catch((err) => {
                    console.log(err);
                })
            })
            .catch((error) => {
                console.log(error);
            });
    }

    // TODO We should handle all the file add/deletion stuff here
    // and then update the projectFiles state

    render() {
        return (
            <div className="app-main-view-root">
                <AppWorkspace {...this.state}/>
                <StatusBar projectId={this.state.projectId}/>
            </div>
        );
    }
}

export default AppMain;