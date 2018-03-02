import React, { Component } from 'react';
import './App.css';
import '@blueprintjs/core/dist/blueprint.css';

import Header from './components/Header/Header';
import AppRoot from './components/AppRoot/AppRoot';

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