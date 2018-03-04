import React, { Component } from 'react';
import { Tab2, Tabs2 } from '@blueprintjs/core';

import './AppConsole.css';

class AppConsole extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedTab: props.selectedTab || 'console-build-output'
        };

        this.handleTabChanged = this.handleTabChanged.bind(this);
    }

    handleTabChanged(selectedTab) {
        this.setState({selectedTab: selectedTab});
    }

    render() {
        return (
            <div className="console-tabs-root">
                <Tabs2 id='tabbedConsole' className="console-tabs pt-dark"
                    onChange={this.handleTabChanged}
                    selectedTabId={this.state.selectedTab}>
                    <Tab2 id="console-build-output" title="Build Messages"></Tab2>
                    <Tab2 id="console-run-output" title="Output"></Tab2>
                    <Tabs2.Expander />
                </Tabs2>
            </div>
        );
    }
}

export default AppConsole;