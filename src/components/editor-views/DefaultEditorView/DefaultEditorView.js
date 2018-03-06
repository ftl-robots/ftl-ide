import React, { Component } from 'react';

import DefaultEditorPane from './DefaultEditorPane/DefaultEditorPane';

import './DefaultEditorView.css';

class DefaultEditorView extends Component {
    render() {
        return (
            <div className="main-area-root default-editor-view-root">
                <DefaultEditorPane />
                <div className="default-editor-view-sidebar">Side</div>
            </div>
        );
    }
}

export default DefaultEditorView;