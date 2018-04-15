import React, { Component } from 'react';

import FilePathView from './FilePathView/FilePathView';
import MonacoEditor from 'react-monaco-editor';

import FileUtils from '../../../../utils/file-utils';

import './DefaultEditorPane.css';

class DefaultEditorPane extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loadedFile: this.props.loadedFile
        };
    }

    editorDidMount(editor, monaco) {
        
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
            if (this.props.onSaveRequested) {
                this.props.onSaveRequested();
            }
        });
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            loadedFile: newProps.loadedFile
        });
    }

    render() {
        const editorOptions = {
            automaticLayout: true
        };

        const fileLang = FileUtils.getFileLanguage(this.state.loadedFile.filePath);

        return (
            <div className="default-editor-pane">
                <div className="default-editor-panel-file-path">
                    <FilePathView filePath={this.state.loadedFile.filePath}/>
                </div>
                <div className="default-editor-pane-editor-root">
                    <MonacoEditor theme="vs-dark"
                                  value={this.state.loadedFile.contents}
                                  language={fileLang}
                                  options={editorOptions}
                                  onChange={this.props.onEditorContentsChange}
                                  editorDidMount={this.editorDidMount.bind(this)}/>
                </div>
                
            </div>
        );
    }
}

export default DefaultEditorPane;