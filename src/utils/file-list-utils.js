import React from 'react';
import { FileStructureTypes } from '../Constants';
import { Tooltip } from '@blueprintjs/core';
import FileListItem from '../components/Sidebar/SidebarFileList/FileListItem';

function makeFolder(def, path, handlers) {
    var folderLabel = (
        <Tooltip content={def.label}>
            <FileListItem labelKey={path + '/' + def.label} 
                          displayText={def.label}
                          type={FileStructureTypes.FOLDER}
                          handlers={handlers}/>
        </Tooltip>
    );

    var ret = {
        iconName: def.isExpanded ? 'folder-open' : 'folder-close',
        isExpanded: !!def.isExpanded,
        hasCaret: true,
        label: folderLabel,
        key: path + '/' + def.label,
        type: FileStructureTypes.FOLDER,
        isSelected: !!def.isSelected,
        childNodes: []
    };

    if (def.children) {
        def.children.forEach((childItem) => {
            if (childItem.type === FileStructureTypes.FOLDER) {
                ret.childNodes.push(makeFolder(childItem, path + '/' + def.label, handlers));
            }
            else if (childItem.type === FileStructureTypes.ITEM) {
                ret.childNodes.push(makeItem(childItem, path + '/' + def.label, handlers));
            }
        });
    }

    return ret;
}

function makeItem(def, path, handlers) {
    var itemLabel = (
        <Tooltip content={def.label}>
            <FileListItem labelKey={path + '/' + def.label}
                          displayText={def.label}
                          type={FileStructureTypes.ITEM}
                          handlers={handlers}/>
        </Tooltip>
    );

    return {
        iconName: 'document',
        label: itemLabel,
        key: path + '/' + def.label,
        type: FileStructureTypes.ITEM,
        isSelected: !!def.isSelected
    };
}

function generateTreeNodes(rootList, handlers) {
    var ret = [];
    rootList = rootList || [];
    rootList.forEach((currItem) => {
        if (currItem.type === FileStructureTypes.FOLDER) {
            ret.push(makeFolder(currItem, '', handlers));
        }
        else if (currItem.type === FileStructureTypes.ITEM) {
            ret.push(makeItem(currItem, '', handlers));
        }
    });

    return ret;
}

export { generateTreeNodes };