import React, { Component } from 'react';
import { Tab2, Tabs2, Icon } from '@blueprintjs/core';

import SidebarFileList2 from './SidebarFileList2/SidebarFileList2';

import './Sidebar.css';

class Sidebar extends Component {
    
    render() {
        const filesIcon = <Icon iconName='document'/>;
        const wrenchIcon = <Icon iconName='wrench'/>;
        return (
            <div className="sidebar-tabs-root">
                <Tabs2 vertical={true} id="sidebar-tabs" className="pt-dark sidebar-tabs">
                    <Tab2 title={filesIcon} id="sidebar-files" panel={<SidebarFileList2 onFileSelected={this.props.onFileSelected}/>}></Tab2>
                    <Tab2 title={wrenchIcon} id="sidebar-settings"></Tab2>
                </Tabs2>
            </div>
        );
    }
}

export default Sidebar;