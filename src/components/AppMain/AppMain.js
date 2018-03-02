import React, { Component } from 'react';

import './AppMain.css';
import AppWorkspace from '../AppWorkspace/AppWorkspace';
import StatusBar from '../StatusBar/StatusBar';

class AppMain extends Component {
    render() {
        return (
            <div className="app-main-view-root">
                <AppWorkspace />
                <StatusBar workspaceId={this.props.params.workspaceId}/>
            </div>
        );
    }
}

export default AppMain;