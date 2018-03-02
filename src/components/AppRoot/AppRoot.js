import React, { Component } from 'react';
import { Router, Route, browserHistory } from 'react-router';

import AppSplash from '../AppSplash/AppSplash';
import AppMain from '../AppMain/AppMain';

class AppRoot extends Component {
    render() {
        return (
            <Router history={browserHistory}>
                <Route path="/" component={AppSplash}/>
                <Route path="/workspace/:workspaceId" component={AppMain}/>
                
            </Router>
        )
    }
}

export default AppRoot;