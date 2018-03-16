import React, { Component } from 'react';
import { Popover, AnchorButton, Tooltip, Position } from '@blueprintjs/core';

import DefaultEditorPane from './DefaultEditorPane/DefaultEditorPane';

import './DefaultEditor.css';

import DemoText from './test.md';
import MarkdownViewer from '../../MarkdownViewer/MarkdownViewer';

class DefaultEditorView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loadedFile: this.props.loadedFile
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            loadedFile: newProps.loadedFile
        });
    }

    render() {
        return (
            <div className="main-area-root default-editor-view-root">
                <DefaultEditorPane onEditorContentsChange={this.props.onEditorContentsChange} loadedFile={this.state.loadedFile}/>
                <div className="default-editor-view-sidebar pt-dark">
                    <Popover content={<div style={{padding:"5px"}}><MarkdownViewer filename={DemoText}/></div>} position={Position.LEFT_TOP}> 
                        <Tooltip content="Documentation" position={Position.LEFT}>
                            <AnchorButton iconName="help" className="pt-large pt-minimal"/>
                        </Tooltip>
                    </Popover>
                </div>
            </div>
        );
    }
}

export default DefaultEditorView;