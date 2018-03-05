import React, { Component } from 'react';
import { Tab2, Tabs2, Icon } from '@blueprintjs/core';

import SidebarFileList from './SidebarFileList/SidebarFileList';

import './Sidebar.css';

class Sidebar extends Component {
    
    render() {
        const filesIcon = <Icon iconName='document'/>;
        const wrenchIcon = <Icon iconName='wrench'/>;
        return (
            <div className="sidebar-tabs-root">
                <Tabs2 vertical={true} id="sidebar-tabs" className="pt-dark">
        <Tab2 title={filesIcon} id="sidebar-files" panel={<SidebarFileList/>}></Tab2>
                    <Tab2 title={wrenchIcon} id="sidebar-settings"></Tab2>
                </Tabs2>
            </div>
        );
    }
}

export default Sidebar;