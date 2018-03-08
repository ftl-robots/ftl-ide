import React, { Component } from 'react';
import PanelGroup from 'react-panelgroup';
import { NonIdealState } from '@blueprintjs/core';

import AppConsole from '../AppConsole/AppConsole';
import Sidebar from '../Sidebar/Sidebar';

import DefaultEditor from '../editor-views/DefaultEditor/DefaultEditor';

import './AppWorkspace.css';

class AppWorkspace extends Component {
    render() {
        var editorView;
        if (this.props.loadedFile) {
            editorView = <DefaultEditor loadedFile={this.props.loadedFile}/>
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
                    <Sidebar />
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