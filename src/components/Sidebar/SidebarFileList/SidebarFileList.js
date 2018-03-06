import React, { Component } from 'react';
import { Treebeard, decorators } from 'react-treebeard';

decorators.Header =({style, node}) => {
    const iconType = node.id === 'root' ? 'projects' :
                        (node.children ? 
                            (node.toggled ? 'folder-open':'folder-close') : 
                            'document');
    
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
    name: 'test-wkspace',
    id: 'root',
    toggled: true,
    children: [
        {
            name: 'ftlrobot',
            children: [
                {
                    name: 'robot',
                    children: [
                        { name: 'Robot.java'}
                    ]
                }
            ]
        },
        
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
            <div>
                <div className="sidebar-item-header">FILES</div>
                <Treebeard className="sidebar-file-list" data={data} onToggle={this.handleToggle.bind(this)} decorators={decorators}/>
            </div>
        );
    }
}

export default SidebarFileList;