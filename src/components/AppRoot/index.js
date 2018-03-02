import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import AppSplash from '../AppSplash';
import AppMain from '../AppMain';

class AppRoot extends Component {
    render() {
        return (
            <Router>
                <Switch>
                    <Route exact path="/" component={AppSplash}/>
                    <Route path="/workspace/:workspaceId" component={AppMain}/>
                </Switch>
            </Router>
        )
    }
}

export default AppRoot;