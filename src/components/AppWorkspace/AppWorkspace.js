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

        console.log('appworkspace props:', props);

        this.state = {
            workspaceId: this.props.workspaceId,
            loadedFile: null,
            projectFiles: this.props.projectFiles || []
        };

        this.onFileSelected = this.onFileSelected.bind(this);
    }

    onFileSelected(filePath) {
        console.log(filePath);

        getProjectFile(this.state.workspaceId, filePath)
            .then((result) => {
                console.log('result: ', result);
                result.json().then((fileResult) => {
                    console.log('fileResult: ', fileResult);
                    this.setState({
                        loadedFile: fileResult
                    });
                })
            });
    }

    componentWillReceiveProps(newProps) {
        console.log('willReceiveProps: ', newProps);
        this.setState({
            projectFiles: newProps.projectFiles || []
        });
    }

    render() {
        console.log('rendering!');
        var editorView;
        if (this.state.loadedFile) {
            editorView = <DefaultEditor loadedFile={this.state.loadedFile}/>
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
                    <Sidebar onFileSelected={this.onFileSelected} fileList={this.state.projectFiles}/>
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