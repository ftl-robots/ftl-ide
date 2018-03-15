import React, { Component } from 'react';
import './StatusBar.css';

class StatusBar extends Component {
    render() {
        return (
            <div className="status-bar-root">
                Current Workspace: {this.props.projectId}
            </div>
        )
    }
}

export default StatusBar;