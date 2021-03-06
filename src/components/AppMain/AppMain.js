import React, { Component } from 'react';
import { HotkeysTarget, Hotkeys, Hotkey, Dialog, Button, Intent } from '@blueprintjs/core';

import { getProjectInfo, getProjectFile, updateFileContents, 
         addFolder, addFile, deleteArtifact,
         getNewFileTypes } from '../../api/projects-api';

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

function _restoreFileListStates(incomingList, oldList) {
    // generate a path key for each thing in the old list
    var pathSettings = {};

    function _traverse(node, prefix, isOldState) {
        var currPath = prefix + node.label;
        
        var data;
        if (isOldState) {
            data = {};
            if (node.isSelected) {
                data.isSelected = true;
            }
            if (node.isExpanded) {
                data.isExpanded = true;
            }

            if (Object.keys(data).length > 0) {
                pathSettings[currPath] = data;
            }
        }
        else {
            data = pathSettings[currPath] || {};
            if (data.isSelected) {
                node.isSelected = true;
            }
            if (data.isExpanded) {
                node.isExpanded = true;
            }
        }

        if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
                _traverse(node.children[i], currPath + "/", isOldState);
            }
        }
    }

    // Generate the old list
    for (var i = 0; i < oldList.length; i++) {
        _traverse(oldList[i], "/", true);
    }

    // go through the new list
    for (var j = 0; j < incomingList.length; j++) {
        _traverse(incomingList[j], "/", false);
    }
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
            handleSaveActiveFile: this.handleSaveActiveFile.bind(this),
            onWorkspaceAddFile: this.handleWorkspaceAddFile.bind(this),
            onWorkspaceAddFolder: this.handleWorkspaceAddFolder.bind(this),
            onWorkspaceDeleteFile: this.handleWorkspaceDeleteFile.bind(this),
            onWorkspaceDeleteFolder: this.handleWorkspaceDeleteFolder.bind(this)
        };

        this.activeFileHandlers = {
            onEditorContentsChange: this.handleEditorContentsChange.bind(this)
        };
    }

    componentWillMount() {
        this.reloadFileList();
    }

    reloadFileList() {
        var oldFiles = this.state.workspace.files.slice(0);
        getProjectInfo(this.state.projectId)
            .then((response) => {
                response.json().then((projInfo) => {
                    var workspace = this.state.workspace;
                    workspace.files = projInfo.files;

                    // Try to restore expanded state
                    _restoreFileListStates(workspace.files, oldFiles);
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

    handleWorkspaceAddFile(path) {
        getNewFileTypes(this.state.projectId)
            .then((fileTypes) => {
                this.setState({
                    workspaceDialogInfo: {
                        title: "Add File",
                        type: "addFile",
                        rootPath: path,
                        fileTypes: fileTypes
                    }
                });
            })
        
    }

    handleWorkspaceAddFolder(path) {
        this.setState({
            workspaceDialogInfo: {
                title: "Add Folder",
                type: "addFolder",
                rootPath: path
            }
        });
    }

    handleWorkspaceDeleteFile(path) {
        this.setState({
            workspaceDialogInfo: {
                title: "Delete File",
                type: "deleteFile",
                rootPath: path
            }
        });
    }

    handleWorkspaceDeleteFolder(path) {
        this.setState({
            workspaceDialogInfo: {
                title: "Delete Folder",
                type: "deleteFolder",
                rootPath: path
            }
        });
    }

    // Actual API calls
    handleAddFileRequest() {
        var newFileName = this.addFileInput.value;
        const existingPath = this.state.workspaceDialogInfo.rootPath;

        // Pull the file extension
        var fileExt;
        var wsDialogInfo = this.state.workspaceDialogInfo;
        for (var i = 0; i < wsDialogInfo.fileTypes.length; i++) {
            if (wsDialogInfo.fileTypes[i].fileType === this.addFileTypeInput.value) {
                fileExt = wsDialogInfo.fileTypes[i].extension;
                break;
            }
        }

        if (fileExt) {
            newFileName += "." + fileExt;
        }

        const newPath = existingPath + "/" + newFileName;
        const templateName = this.addFileTypeInput.value;
        
        addFile(this.state.projectId, newPath, templateName)
            .then((result) => {
                if (result.status !== 200) {
                    // Invalid response code
                    result.json()
                        .then((response) => {
                            console.warn("(" + result.status + ") ", response);
                        });
                }
            })
            .catch((err) => {
                console.log("Error: ", err);
            })
            .finally(() => {
                // Kill the prompt
                this.addFileInput = undefined;
                this.addFileTypeInput = undefined;
                this.handleDialogCancel();

                this.reloadFileList();
            });
    }

    handleAddFolderRequest() {
        const newFolderName = this.addFolderInput.value;
        const existingPath = this.state.workspaceDialogInfo.rootPath;

        const newPath = existingPath + "/" + newFolderName;

        addFolder(this.state.projectId, newPath)
            .then((result) => {
                // TODO We should move the status handling code into api
                if (result.status !== 200) {
                    // Invalid response code
                    result.json()
                        .then((response) => {
                            console.warn("(" + result.status + ") ", response);
                        });
                }
            })
            .catch((err) => {
                console.log("Error: ", err);
            })
            .finally(() => {
                // Kill the prompt
                this.addFolderInput = undefined;
                this.handleDialogCancel();

                this.reloadFileList();
            });
    }

    handleDeleteArtifact(isFolder) {
        const existingPath = this.state.workspaceDialogInfo.rootPath;

        deleteArtifact(this.state.projectId, existingPath, isFolder)
            .then((result) => {
                // TODO We should move the status handling code into api
                if (result.status !== 200) {
                    // Invalid response code
                    result.json()
                        .then((response) => {
                            console.warn("(" + result.status + ") ", response);
                        });
                }
            })
            .catch((err) => {
                console.log("Error: ", err);
            })
            .finally(() => {
                // Kill the prompt
                this.handleDialogCancel();

                this.reloadFileList();
            });
    }

    handleDialogCancel() {
        this.setState({
            workspaceDialogInfo: null
        });
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
        // Set up the dialog properties (if necessary)
        var dialogVisible = false;
        var dialogTitle = "";
        var dialogContent = <div/>;
        var dialogFooter = <div/>;
        if (this.state.workspaceDialogInfo) {
            var wsDialogInfo = this.state.workspaceDialogInfo;
            dialogVisible = true;
            dialogTitle = wsDialogInfo.title;

            if (wsDialogInfo.type === "addFolder") {
                dialogTitle = "Add Folder"
                dialogContent = <div className="pt-dialog-body">
                                    <span>Folder Name:</span>
                                    <input className="pt-input pt-fill"
                                           type="text"
                                           ref={(inputElt) => {this.addFolderInput = inputElt}}/>
                                </div>;
            }
            else if (wsDialogInfo.type === "addFile") {
                dialogTitle = "Add File"
                dialogContent = <div className="pt-dialog-body">
                                    <span>File Name:</span>
                                    <input className="pt-input pt-fill"
                                           type="text"
                                           ref={(inputElt) => {this.addFileInput = inputElt}}/>
                                    <span>File Type:</span>
                                    <div className="pt-select pt-fill">
                                        <select ref={(selElt) => { this.addFileTypeInput = selElt}}>
                                            {
                                                wsDialogInfo.fileTypes.map((typeInfo) => {
                                                    return <option value={typeInfo.fileType}>{typeInfo.displayText}</option>;
                                                })
                                            }
                                        </select>
                                    </div>
                                </div>;
            }
            else if (wsDialogInfo.type === "deleteFolder") {
                dialogTitle = "Delete Folder";
                dialogContent = <div className="pt-dialog-body">
                                    <span>Delete {wsDialogInfo.rootPath}?</span>
                                </div>;
            }
            else if (wsDialogInfo.type === "deleteFile") {
                dialogTitle = "Delete File";
                dialogContent = <div className="pt-dialog-body">
                                    <span>Delete {wsDialogInfo.rootPath}?</span>
                                </div>;
            }

            // Common footer
            if (wsDialogInfo.type === "addFile" || wsDialogInfo.type === "addFolder") {
                var addHandler = wsDialogInfo.type === "addFile" ?
                                this.handleAddFileRequest.bind(this) :
                                this.handleAddFolderRequest.bind(this);

                dialogFooter = <div className="pt-dialog-footer">
                                    <div className="pt-dialog-footer-actions">
                                        <Button text="Cancel"
                                                onClick={this.handleDialogCancel.bind(this)}/>
                                        <Button intent={Intent.PRIMARY}
                                                text="Add"
                                                onClick={addHandler}/>
                                    </div>
                                </div>;
            }
            else if (wsDialogInfo.type === "deleteFile" || wsDialogInfo.type === "deleteFolder") {
                var deleteHandler = this.handleDeleteArtifact.bind(this, (wsDialogInfo.type === "deleteFolder"));

                dialogFooter = <div className="pt-dialog-footer">
                                    <div className="pt-dialog-footer-actions">
                                        <Button text="Cancel"
                                                onClick={this.handleDialogCancel.bind(this)}/>
                                        <Button intent={Intent.DANGER}
                                                text="Delete"
                                                onClick={deleteHandler}/>
                                    </div>
                                </div>;
            }
        }

        return (
            <div className="app-main-view-root">
                <AppWorkspace {...this.state} {...this.workspaceHandlers} {...this.activeFileHandlers}/>
                <StatusBar projectId={this.state.projectId}/>
                {/* --- Dialog boxes for adding/deleting files and folder --- */}
                <Dialog
                    isOpen={dialogVisible}
                    title={dialogTitle}
                    onClose={this.handleDialogCancel.bind(this)}>
                    {dialogContent}
                    {dialogFooter}
                </Dialog>

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