import React, { Component } from 'react';
import { NonIdealState } from '@blueprintjs/core';

class AppSplash extends Component {
    render() {
        return (
            <NonIdealState className="app-main-view"
                           visual="folder-open"
                           title="Load Project"
                           description="Create or Load a project"/>
        )
    }
}

export default AppSplash;