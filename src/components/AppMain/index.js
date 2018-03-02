import React, { Component } from 'react';

import './AppMain.css';
import AppWorkspace from '../AppWorkspace';
import StatusBar from '../StatusBar';

class AppMain extends Component {
    render() {
        return (
            <div className="app-main-view-root">
                <AppWorkspace />
                <StatusBar workspaceId={this.props.match.params.workspaceId}/>
            </div>
        );
    }
}

export default AppMain;