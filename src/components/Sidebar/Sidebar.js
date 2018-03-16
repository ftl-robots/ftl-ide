import React, { Component } from 'react';
import { Tab2, Tabs2, Icon, Tooltip, Position } from '@blueprintjs/core';

import SidebarFileList from './SidebarFileList/SidebarFileList';

import './Sidebar.css';

class Sidebar extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            fileList: this.props.fileList || []
        };

        this.fileListHandlers = {
            onWorkspaceNodeSelected: this.props.onWorkspaceNodeSelected,
            onWorkspaceNodeExpanded: this.props.onWorkspaceNodeExpanded,
            onWorkspaceNodeCollapsed: this.props.onWorkspaceNodeCollapsed
        };
    }

    componentWillReceiveProps(newProps) {
        this.fileListHandlers = {
            onWorkspaceNodeSelected: this.props.onWorkspaceNodeSelected,
            onWorkspaceNodeExpanded: this.props.onWorkspaceNodeExpanded,
            onWorkspaceNodeCollapsed: this.props.onWorkspaceNodeCollapsed
        };

        this.setState({
            fileList: newProps.fileList || []
        });
    }

    render() {
        const filesTab = (
            <Tooltip content="File Explorer" position={Position.RIGHT}>
                <Icon iconName="document"/>
            </Tooltip>
        );

        const configTab = (
            <Tooltip content="Configuration" position={Position.RIGHT}>
                <Icon iconName="wrench"/>
            </Tooltip>
        );
        
        return (
            <div className="sidebar-tabs-root">
                <Tabs2 vertical={true} id="sidebar-tabs" className="pt-dark sidebar-tabs">
                    <Tab2 title={filesTab} id="sidebar-files" panel={<SidebarFileList onFileSelected={this.props.onFileSelected} fileList={this.state.fileList} {...this.fileListHandlers}/>}></Tab2>
                    <Tab2 title={configTab} id="sidebar-settings"></Tab2>
                </Tabs2>
            </div>
        );
    }
}

export default Sidebar;