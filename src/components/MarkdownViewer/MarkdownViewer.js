import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';

class MarkdownViewer extends Component {
    constructor(props) {
        super(props);

        var isLoading = false;
        var filename = null;
        var displayText = 'Loading...';
        if (props.text) {
            isLoading = false;
            displayText = props.text;
        }
        else if(props.filename) {
            isLoading = true;
            filename = props.filename;
        }

        this.state = {
            text: displayText,
            isLoading: isLoading,
            filename: filename
        };
    }

    componentDidMount() {
        if (this.state.isLoading && this.state.filename) {
            this.loadMarkdownFile(this.state.filename);
        }
    }

    loadMarkdownFile(file) {
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, false);
        rawFile.onreadystatechange = () => {
            if (rawFile.readyState === 4) {
                if (rawFile.status === 200 || rawFile.status === 0) {
                    var allText = rawFile.responseText;
                    this.setState({
                        text: allText,
                        filename: null,
                        isLoading: false
                    });

                }
            }
        };
        rawFile.send(null);
    }

    render() {
        return (
            <ReactMarkdown source={this.state.text}/>
        )
    }
}

export default MarkdownViewer;