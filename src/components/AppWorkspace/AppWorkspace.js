import React, { Component } from 'react';
import PanelGroup from 'react-panelgroup';

import AppConsole from '../AppConsole/AppConsole';
import Sidebar from '../Sidebar/Sidebar';

class AppWorkspace extends Component {
    render() {
        return (
            <div className="app-main-view-workspace">
                <PanelGroup direction="row" 
                            borderColor="grey" 
                            panelWidths={[
                                { size: 200, minSize: 50},
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
                        <div>Main Area</div>
                        <AppConsole />
                    </PanelGroup>
                </PanelGroup>
            </div>
        )
    }
}

export default AppWorkspace;