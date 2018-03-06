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
                <div className="default-editor-pane-editor-root">
                    <MonacoEditor theme="vs-dark"
                              options={editorOptions}/>
                </div>
                
            </div>
        );
    }
}

export default DefaultEditorPane;