import React, { Component } from 'react';
import PanelGroup from 'react-panelgroup';
import { NonIdealState } from '@blueprintjs/core';

import AppConsole from '../AppConsole/AppConsole';
import Sidebar from '../Sidebar/Sidebar';

import DefaultEditor from '../editor-views/DefaultEditor/DefaultEditor';

import { getProjectFile } from '../../api/projects-api';

import './AppWorkspace.css';

class AppWorkspace extends Component {
    constructor(props) {
        super(props);

        this.state = {
            projectId: this.props.projectId,
            projectType: this.props.projectType,
            workspace: {
                files: this.props.workspace.files || [],
                activeFile: null
            }
        };

        this.onFileSelected = this.onFileSelected.bind(this);
        this.fileListHandlers = {
            onWorkspaceNodeSelected: this.props.onWorkspaceNodeSelected,
            onWorkspaceNodeExpanded: this.props.onWorkspaceNodeExpanded,
            onWorkspaceNodeCollapsed: this.props.onWorkspaceNodeCollapsed
        };
    }

    onFileSelected(filePath) {

        getProjectFile(this.state.projectId, filePath)
            .then((result) => {
                result.json().then((fileResult) => {
                    // TODO This should actually bubble up to AppMain
                    var workspace = this.state.workspace;
                    workspace.activeFile = fileResult;
                    this.setState({
                        workspace: workspace
                    });
                    
                })
            });
    }

    componentWillReceiveProps(newProps) {
        this.fileListHandlers = {
            onWorkspaceNodeSelected: this.props.onWorkspaceNodeSelected,
            onWorkspaceNodeExpanded: this.props.onWorkspaceNodeExpanded,
            onWorkspaceNodeCollapsed: this.props.onWorkspaceNodeCollapsed
        };
        
        var workspace = this.state.workspace;
        workspace.files = newProps.workspace.files || [];
        this.setState({
            workspace: workspace
        });
    }

    render() {
        var editorView;
        if (this.state.workspace.activeFile) {
            editorView = <DefaultEditor loadedFile={this.state.workspace.activeFile}/>
        }
        else {
            editorView = (
                <div className="no-file-loaded">
                    <NonIdealState
                        className="pt-dark"
                        visual="document"
                        title="No file loaded"
                        description="Pick a file from the file explorer"
                    />
                </div>
            );
        }
        return (
            <div className="app-main-view-workspace">
                <PanelGroup direction="row" 
                            borderColor="grey" 
                            panelWidths={[
                                { size: 250, minSize: 50},
                                { minSize: 100}
                            ]}
                            style={{
                                height: 'unset',
                                position: 'absolute',
                                top: 0,
                                left:0,
                                right:0,
                                bottom: 0
                            }}>
                    <Sidebar onFileSelected={this.onFileSelected} fileList={this.state.workspace.files} {...this.fileListHandlers}/>
                    <PanelGroup direction="column" 
                                borderColor="grey"
                                panelWidths={[
                                    { minSize: 200, resize: 'stretch'},
                                    { size: 200, minSize: 50, resize: 'dynamic'}  
                                ]}>
                        
                        {editorView}
                        <AppConsole />
                    </PanelGroup>
                </PanelGroup>
            </div>
        )
    }
}

export default AppWorkspace;