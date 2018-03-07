import React, { Component } from 'react';

import FilePathView from './FilePathView/FilePathView';
import MonacoEditor from 'react-monaco-editor';

import FileUtils from '../../../../utils/file-utils';

import './DefaultEditorPane.css';

class DefaultEditorPane extends Component {
    render() {
        const editorOptions = {
            automaticLayout: true
        };

        const fileLang = FileUtils.getFileLanguage(this.props.filePath);

        return (
            <div className="default-editor-pane">
                <div className="default-editor-panel-file-path">
                    <FilePathView filePath={this.props.filePath}/>
                </div>
                <div className="default-editor-pane-editor-root">
                    <MonacoEditor theme="vs-dark"
                                  language={fileLang}
                                  options={editorOptions}/>
                </div>
                
            </div>
        );
    }
}

export default DefaultEditorPane;