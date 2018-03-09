import React, { Component } from 'react';
import { getProjectFiles } from '../../api/projects-api';

import './AppMain.css';
import AppWorkspace from '../AppWorkspace/AppWorkspace';
import StatusBar from '../StatusBar/StatusBar';

class AppMain extends Component {
    constructor(props) {
        super(props);

        this.state = {
            workspaceId: this.props.params.workspaceId
        };
    }

    componentWillMount() {
        getProjectFiles(this.state.workspaceId)
            .then((response) => {
                console.log(response);
                response.json().then((value) => {
                    console.log('json value: ', value);
                })
                .catch((err) => {
                    console.log(err);
                })
            })
            .catch((error) => {
                console.log(error);
            })
    }

    render() {
        var demoLoadedFile = {
            filePath: '/'
        }
        return (
            <div className="app-main-view-root">
                <AppWorkspace />
                <StatusBar workspaceId={this.state.workspaceId}/>
            </div>
        );
    }
}

export default AppMain;