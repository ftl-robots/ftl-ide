import React, { Component } from 'react';
import PanelGroup from 'react-panelgroup';

class AppWorkspace extends Component {
    render() {
        console.log(this.props);
        return (
            <PanelGroup className="app-main-view" 
                        direction="row" 
                        borderColor="grey" 
                        panelWidths={[
                            { size: 200, minSize: 50, resize: 'dynamic'},
                            { minSize: 100, resize: 'stretch'}
                        ]}>
                <div>Sidebar</div>
                <PanelGroup direction="column" 
                            borderColor="grey"
                            panelWidths={[
                                { minSize: 200, resize: 'stretch'},
                                { size: 200, minSize: 50, resize: 'dynamic'}  
                            ]}>
                    <div>Main Area</div>
                    <div>Console</div>
                </PanelGroup>
            </PanelGroup>
        )
    }
}

export default AppWorkspace;