import React, { Component } from 'react';
import PanelGroup from 'react-panelgroup';
import './App.css';
import '@blueprintjs/core/lib/css/blueprint.css';

import Header from './components/Header';
import AppRoot from './components/AppRoot';

class App extends Component {
    render() {
        return (
            <div id="app-root">
                <Header />
                <AppRoot />
            </div>
        );
    }
}

export default App;