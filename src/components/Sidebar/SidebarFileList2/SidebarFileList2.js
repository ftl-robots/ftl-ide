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

        var projectNodes = generateTreeNodes(props.projectWorkspace, handlers);

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

        this.handleNodeClick = this.handleNodeClick.bind(this);
        this.handleNodeExpand = this.handleNodeExpand.bind(this);
        this.handleNodeCollapse = this.handleNodeCollapse.bind(this);
        this.forEachNode = this.forEachNode.bind(this);
    }

    componentWillReceiveProps(newProps) {
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

        var projectNodes = generateTreeNodes(newProps.projectWorkspace, handlers);

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

    }

    handleNodeCollapse(nodeData) {

    }

    handleNodeExpand(nodeData) {

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
            <Tree contents={this.state.nodes}
                  onNodeClick={this.handleNodeClick}
                  onNodeExpand={this.handleNodeExpand}
                  onNodeCollapse={this.handleNodeCollapse}/>
        )
    }
}

export default SidebarFileList2;
