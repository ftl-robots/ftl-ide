import React, { Component } from 'react';
import { Tree, Tooltip } from '@blueprintjs/core';
import FileListItem from './FileListItem';
import { FileStructureTypes } from '../../../Constants';
import { generateTreeNodes } from '../../../utils/file-list-utils';

class SidebarFileList2 extends Component {
    constructor(props) {
        super(props);

        var handlers = {
            addFile: this.props.onAddFile,
            addFolder: this.props.onAddFolder,
            deleteFile: this.props.onDeleteFile,
            deleteFolder: this.props.onDeleteFolder
        };

        var rootLabel = (
            <Tooltip content="Robot Project">
                <FileListItem labelKey="/"
                              displayText="Robot Project"
                              type={FileStructureTypes.PROJECT_ROOT}
                              handlers={handlers}/>
            </Tooltip>
        );

        var projectNodes = generateTreeNodes(props.fileList, handlers);

        var rootNode = {
            iconName: 'projects',
            label: rootLabel,
            key: '/',
            type: FileStructureTypes.PROJECT_ROOT,
            childNodes: projectNodes,
            isExpanded: true
        };

        this.state = {
            nodes: [rootNode]
        };

        console.log('props! ', props);

        this.handleNodeClick = this.handleNodeClick.bind(this);
        this.handleNodeExpand = this.handleNodeExpand.bind(this);
        this.handleNodeCollapse = this.handleNodeCollapse.bind(this);
        this.forEachNode = this.forEachNode.bind(this);
    }

    componentWillReceiveProps(newProps) {
        console.log('hi newprops:', newProps);
        var handlers = {
            addFile: newProps.onAddFile,
            addFolder: newProps.onAddFolder,
            deleteFile: newProps.onDeleteFile,
            deleteFolder: newProps.onDeleteFolder
        };

        var rootLabel = (
            <Tooltip content="Robot Project">
                <FileListItem labelKey="/"
                              displayText="Robot Project"
                              type={FileStructureTypes.PROJECT_ROOT}
                              handlers={handlers}/>
            </Tooltip>
        );

        var projectNodes = generateTreeNodes(newProps.fileList, handlers);

        var rootNode = {
            iconName: 'projects',
            label: rootLabel,
            key: '/',
            type: FileStructureTypes.PROJECT_ROOT,
            childNodes: projectNodes,
            isExpanded: true
        };

        this.setState({
            nodes: [rootNode]
        });
    }

    handleNodeClick(nodeData, nodePath, e) {
        const originallySelected = nodeData.isSelected;
        this.forEachNode(this.state.nodes, (n) => n.isSelected = false);

        nodeData.isSelected = originallySelected === null ? true : !originallySelected;
        
        if (nodeData.type === FileStructureTypes.ITEM) {
            this.props.onFileSelected(nodeData.key);
        }
    }

    handleNodeCollapse(nodeData) {
        if (nodeData.type === FileStructureTypes.FOLDER) {
            nodeData.isExpanded = false;
            nodeData.iconName = 'folder-open';
            this.setState(this.state);
            // Inform upstairs
        }
    }

    handleNodeExpand(nodeData) {
        console.log('nodeData: ', nodeData);
        if (nodeData.type === FileStructureTypes.FOLDER) {
            nodeData.isExpanded = true;
            nodeData.iconName = 'folder-open';
            this.setState(this.state);
            // inform upstairs about what went down?
        }
    }

    forEachNode(nodes, callback) {
        if (!nodes) {
            return;
        }

        for (const node of nodes) {
            callback(node);
            this.forEachNode(node.childNodes, callback);
        }
    }

    render() {
        return (
            <div>
                <div className="sidebar-item-header">FILES</div>
                <Tree contents={this.state.nodes}
                    onNodeClick={this.handleNodeClick}
                    onNodeExpand={this.handleNodeExpand}
                    onNodeCollapse={this.handleNodeCollapse}/>
            </div>
        )
    }
}

export default SidebarFileList2;
