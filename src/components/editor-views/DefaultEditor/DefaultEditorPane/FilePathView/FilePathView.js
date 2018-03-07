import React, { Component } from 'react';
import { CollapsibleList, MenuItem, Classes } from '@blueprintjs/core';
import classNames from 'classnames';

class FilePathView extends Component {
    renderBreadcrumb(props) {
        if (props.isFile) {
            return <span className={classNames(Classes.BREADCRUMB, Classes.BREADCRUMB_CURRENT)}>{props.text}</span>;
        }
        else {
            return <span className={Classes.BREADCRUMB}>{props.text}</span>
        }
    }

    render() {
        var listObjs = [];

        if (this.props.filePath) {
            var pathObjs = this.props.filePath.split('/');
            var dirObjs = pathObjs.slice(0, pathObjs.length - 1);

            dirObjs.forEach((dirStr) => {
                if (dirStr) {
                    listObjs.push({
                        iconName: 'folder-close',
                        text: dirStr
                    });
                }
            });
            if (pathObjs.length > 0) {
                listObjs.push({
                    iconName: 'document',
                    text: pathObjs[pathObjs.length - 1],
                    isFile: true
                });
            }
        }
        else {
            listObjs.push({
                iconName: 'code',
                text: 'No File Loaded',
                isFile: true
            });
        }

        return (
            <CollapsibleList
                className={classNames(Classes.BREADCRUMBS, "pt-dark")}
                dropdownTarget={<span className={Classes.BREADCRUMBS_COLLAPSED} />}
                renderVisibleItem={this.renderBreadcrumb}
                visibleItemCount={5}>
                    {
                        listObjs.map((itemInfo, i) => <MenuItem {...itemInfo} key={"node-" + i}/>)
                    }
            </CollapsibleList>
        )
    }
}

export default FilePathView;