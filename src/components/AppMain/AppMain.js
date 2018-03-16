import React, { Component } from 'react';
import { getProjectInfo } from '../../api/projects-api';

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
        getProjectInfo(this.state.projectId)
            .then((response) => {
                response.json().then((projInfo) => {
                    var workspace = this.state.workspace;
                    workspace.files = projInfo.files;
                    this.setState({
                        workspace: workspace
                    });
                })
                .catch((err) => {
                    console.error(err);
                })
            })
            .catch((err) => {
                console.error(err);
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