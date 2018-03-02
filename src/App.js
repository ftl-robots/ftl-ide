import React, { Component } from 'react';
import PanelGroup from 'react-panelgroup';
import './App.css';
import '@blueprintjs/core/lib/css/blueprint.css';

import Header from './components/Header';
import StatusBar from './components/StatusBar';

class App extends Component {
    render() {
        return (
            <div id="app-root">
                <Header />
                <PanelGroup id="app-main" 
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
                <StatusBar />
            </div>
        );
    }
}

export default App;