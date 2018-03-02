import React, { Component } from 'react';
import PanelGroup from 'react-panelgroup';

class App extends Component {
    render() {
        return (
            <div style={{height:"100%"}}>
                <PanelGroup borderColor="grey">
                    <div>Panel 1</div>
                    <div>Panel 2</div>
                    <div>Panel 3</div>
                </PanelGroup>
            </div>
        );
    }
}

export default App;