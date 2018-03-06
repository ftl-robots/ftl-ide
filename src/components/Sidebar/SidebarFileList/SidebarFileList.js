import React, { Component } from 'react';
import { Treebeard, decorators } from 'react-treebeard';

decorators.Header =({style, node}) => {
    const iconType = node.children ? (node.toggled ? 'folder-open':'folder-close') : 'document';
    
    return (
        <div style={style.base}>
            <div style={style.title}>
                <span className={"pt-icon-standard pt-icon-" + iconType} 
                      style={{marginRight: '5px'}}></span>
                {node.name}
            </div>
        </div>
    );
};

const data = {
    name: 'root',
    toggled: true,
    children: [
        {
            name: 'parent',
            children: [
                { name: 'child1' },
                { name: 'child2' }
            ]
        },
        {
            name: 'parent',
            children: [
                {
                    name: 'nested parent',
                    children: [
                        { name: 'nested child 1' },
                        { name: 'nested child 2' }
                    ]
                }
            ]
        }
    ]
};

class SidebarFileList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            cursor: null
        };
    }

    handleToggle(node, toggled){
        console.log('node:' , node);
        console.log('toggled:', toggled);
        // Unset the cursor
        if(this.state.cursor) {
            var cursor = this.state.cursor;
            cursor.active = false;
            this.setState({
                cursor: cursor
            });
        }
        node.active = true;
        if(node.children) { 
            node.toggled = toggled; 
        }
        
        this.setState({ cursor: node });
    }

    render() {
        

        return (
            <Treebeard className="sidebar-file-list" data={data} onToggle={this.handleToggle.bind(this)} decorators={decorators}/>
        );
    }
}

export default SidebarFileList;