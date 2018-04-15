import React, { Component } from 'react';
import { HotkeysTarget, Hotkeys, Hotkey } from '@blueprintjs/core';

import { getProjectInfo, getProjectFile, updateFileContents } from '../../api/projects-api';

import './AppMain.css';
import AppWorkspace from '../AppWorkspace/AppWorkspace';
import StatusBar from '../StatusBar/StatusBar';

// Helpers
function updateExpandedState(nodes, pathArray, expanded) {
    if (pathArray.length === 0) return;

    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (pathArray.length === 1) {
            if (node.label === pathArray[0]) {
                node.isExpanded = !!expanded;
                return;
            }
        }
        else {
            if (node.label === pathArray[0]) {
                updateExpandedState(node.children, pathArray.slice(1), expanded);
                break;
            }
        }
    }
}

function updateSelectedState(nodes, pathArray) {
    // traverse fully
    function _traverse(node) {
        node.isSelected = false;

        if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
                _traverse(node.children[i]);
            }
        }
    }

    function _find(nodeList, pathArr) {
        if (pathArr.length === 0) return;

        for (var i = 0; i < nodeList.length; i++) {
            var node = nodeList[i];
            if (pathArr.length === 1) {
                if (node.label === pathArr[0]) {
                    node.isSelected = true;
                    return;
                }
            }
            else {
                if (node.label === pathArr[0]) {
                    _find(node.children, pathArr.slice(1));
                    break;
                }
            }
        }
    }

    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        _traverse(node, pathArray);
    }
    _find(nodes, pathArray);
}

class AppMain extends Component {
    constructor(props) {
        super(props);

        this.state = {
            projectId: this.props.params.projectId,
            projectType: null,
            workspace: {
                files: [],
                activeFile: null
            }
        };

        this.activeFileSaveStatus = {
            baseContent: '',
            currentContent: '',
            shouldSave: false
        };

        this.autoSaveTimer = setInterval(() => {
            if (this.activeFileSaveStatus.shouldSave) {
                console.log('saving...');
                this._saveFileInternal();
            }
        }, 10000);

        this.handleSaveActiveFile = this.handleSaveActiveFile.bind(this);

        this.workspaceHandlers = {
            onWorkspaceNodeSelected: this.handleWorkspaceNodeSelected.bind(this),
            onWorkspaceNodeExpanded: this.handleWorkspaceNodeExpanded.bind(this),
            onWorkspaceNodeCollapsed: this.handleWorkspaceNodeCollapsed.bind(this),
            onFileSelected: this.handleWorkspaceFileSelected.bind(this),
            handleSaveActiveFile: this.handleSaveActiveFile.bind(this)
        };

        this.activeFileHandlers = {
            onEditorContentsChange: this.handleEditorContentsChange.bind(this)
        };
    }

    componentWillMount() {
        getProjectInfo(this.state.projectId)
            .then((response) => {
                response.json().then((projInfo) => {
                    var workspace = this.state.workspace;
                    workspace.files = projInfo.files;
                    this.setState({
                        workspace: workspace
                    });
                })
                .catch((err) => {
                    console.error(err);
                })
            })
            .catch((err) => {
                console.error(err);
            });
        
    }

    // File Explorer handlers
    handleWorkspaceNodeSelected(path) {
        if (!path) return;

        var files = this.state.workspace.files.slice(0);
        var ws = this.state.workspace;
        
        var pathParts = path.split('/').slice(1);

        updateSelectedState(files, pathParts);
        ws.files = files;
        this.setState({
            workspace: ws
        });
    }

    handleWorkspaceNodeExpanded(path) {
        var files = this.state.workspace.files.slice(0);
        var ws = this.state.workspace;
        var pathParts = path.split('/').slice(1);
        updateExpandedState(files, pathParts, true);
        ws.files = files;
        this.setState({
            workspace: ws
        });
    }

    handleWorkspaceNodeCollapsed(path) {
        var files = this.state.workspace.files.slice(0);
        var ws = this.state.workspace;
        var pathParts = path.split('/').slice(1);
        updateExpandedState(files, pathParts, false);
        ws.files = files;
        this.setState({
            workspace: ws
        });
    }

    handleWorkspaceFileSelected(path) {
        var shouldLoad = false;
        if (this.state.workspace.activeFile) {
            if (this.state.workspace.activeFile.filePath !== path) {
                console.log('Different file selected');
                shouldLoad = true;
            }
        }
        else {
            shouldLoad = true;
        }

        if (shouldLoad) {
            getProjectFile(this.state.projectId, path)
                .then((result) => {
                    result.json()
                        .then((fileResult) => {
                            var ws = this.state.workspace;
                            ws.activeFile = fileResult;
                            // Save this to the activeFileSaveStatus prop
                            this.activeFileSaveStatus.baseContent = fileResult.contents;
                            this.activeFileSaveStatus.currentContent = fileResult.contents;
                            
                            this.activeFileSaveStatus.shouldSave = false;
                            this.setState({
                                workspace: ws
                            });
                        });
                });
        }
    }

    // Active File
    handleEditorContentsChange(newValue) {
        this.activeFileSaveStatus.currentContent = newValue;
        this.activeFileSaveStatus.shouldSave = true;
    }

    // TODO We should handle all the file add/deletion stuff here
    // and then update the projectFiles state
    handleSaveActiveFile() {
        if (this.state.workspace.activeFile) {
            console.log('Saving File');
            this._saveFileInternal();
        }
        else {
            console.log('No active file');
        }
    }

    _saveFileInternal() {
        updateFileContents(this.state.projectId, 
                           this.state.workspace.activeFile.filePath,
                           this.activeFileSaveStatus.currentContent, 
                           false).then((status) => {
            if (status.status === 200 || status.status === 0) {
                this.activeFileSaveStatus.baseContent = this.activeFileSaveStatus.currentContent;
                this.activeFileSaveStatus.shouldSave = false;
            }
            else {
                console.error("Problem updating remote file: ", status.body);
            }
        });
    }

    render() {
        return (
            <div className="app-main-view-root">
                <AppWorkspace {...this.state} {...this.workspaceHandlers} {...this.activeFileHandlers}/>
                <StatusBar projectId={this.state.projectId}/>
            </div>
        );
    }

    renderHotkeys() {
        return (
            <Hotkeys>
                <Hotkey global={true}
                        combo="mod + s"
                        label="Save Active File"
                        preventDefault={true}
                        onKeyDown={this.handleSaveActiveFile}/>
            </Hotkeys>
        )
    }
}

HotkeysTarget(AppMain);

export default AppMain;