import React, { Component } from 'react';
import { getProjectAllFiles } from '../../api/projects-api';

import './AppMain.css';
import AppWorkspace from '../AppWorkspace/AppWorkspace';
import StatusBar from '../StatusBar/StatusBar';

class AppMain extends Component {
    constructor(props) {
        super(props);

        this.state = {
            workspaceId: this.props.params.workspaceId,
            projectFiles: []
        };
    }

    componentWillMount() {
        getProjectAllFiles(this.state.workspaceId)
            .then((response) => {
                response.json().then((projFiles) => {
                    console.log('cwillmount: ', projFiles);
                    this.setState({
                        projectFiles: projFiles
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
        var demoLoadedFile = {
            filePath: '/'
        }
        console.log('rendering!', this.state);
        return (
            <div className="app-main-view-root">
                <AppWorkspace workspaceId={this.state.workspaceId} projectFiles={this.state.projectFiles}/>
                <StatusBar workspaceId={this.state.workspaceId}/>
            </div>
        );
    }
}

export default AppMain;