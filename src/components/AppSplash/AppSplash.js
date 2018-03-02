import React, { Component } from 'react';
import { NonIdealState } from '@blueprintjs/core';
import ProjectCreatorDialog from './ProjectCreatorDialog/ProjectCreatorDialog';

class AppSplash extends Component {
    render() {
        return (
            <div className="app-main-view-root">
                <NonIdealState className="app-main-view"
                           visual="folder-open"
                           title="Load Project"
                           description="Create or Load a project"/>
                <ProjectCreatorDialog shouldShowDialog={true}/>
            </div>
            
        )
    }
}

export default AppSplash;