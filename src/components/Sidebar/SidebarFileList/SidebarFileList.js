import React, { Component } from 'react';
import { Treebeard } from 'react-treebeard';

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
        if(this.state.cursor){this.state.cursor.active = false;}
        node.active = true;
        if(node.children){ node.toggled = toggled; }
        this.setState({ cursor: node });
    }

    render() {
        

        return (
            <Treebeard data={data} onToggle={this.handleToggle.bind(this)}/>
        );
    }
}

export default SidebarFileList;