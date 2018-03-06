import React, { Component } from 'react';

import FilePathView from './FilePathView/FilePathView';
import MonacoEditor from 'react-monaco-editor';

import './DefaultEditorPane.css';

class DefaultEditorPane extends Component {
    render() {
        const editorOptions = {
            automaticLayout: true
        };

        return (
            <div className="default-editor-pane">
                <FilePathView filePath={"root/meh/hi.java"}/>
                <MonacoEditor theme="vs-dark"
                              options={editorOptions}
                              className="default-editor-pane-editor-root" />
            </div>
        );
    }
}

export default DefaultEditorPane;