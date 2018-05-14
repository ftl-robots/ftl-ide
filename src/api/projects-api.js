export function getProjects() {
    return fetch('/api/projects');
}

export function getTemplates() {
    return fetch('/api/templates');
}

export function createProject(type) {
    return fetch('/api/projects', {
        body: { projectType: type },
        method: 'POST',

    });
}

export function getProjectData(projectId) {
    return fetch('/api/projects/' + projectId);
}

export function getProjectAllFiles(projectId) {
    return fetch('/api/projects/' + projectId + '/files');
}

export function getProjectFile(projectId, filePath) {
    return fetch('/api/projects/' + projectId + '/files/' + encodeURIComponent(filePath));
}

export function getProjectInfo(projectId) {
    return fetch('/api/projects/' + projectId);
}

export function updateFileContents(projectId, filePath, update, isDiff) {
    var updateObj = {
        update: update,
        isDiff: !!isDiff
    };

    return fetch('/api/projects/' + projectId + '/files/' + encodeURIComponent(filePath), {
        body: JSON.stringify(updateObj),
        method: 'PUT',
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    });
}

export function addFile(projectId, filePath, templateName) {
    var addFileObj = {
        createType: "file",
        templateName: templateName
    };

    return fetch("/api/projects/" + projectId + "/files/" + encodeURIComponent(filePath), {
        body: JSON.stringify(addFileObj),
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json"
        })
    });
}

export function addFolder(projectId, folderPath) {
    var addFolderObj = {
        createType: "folder"
    };

    return fetch("/api/projects/" + projectId + "/files/" + encodeURIComponent(folderPath), {
        body: JSON.stringify(addFolderObj),
        method: "POST",
        headers: new Headers({
            "Content-Type": "application/json"
        })
    });
}

export function deleteArtifact(projectId, path, isFolder) {
    var delFolderObj = {
        deleteType: isFolder ? "folder" : "file"
    };

    return fetch("/api/projects/" + projectId + "/files/" + encodeURIComponent(path), {
        body: JSON.stringify(delFolderObj),
        method: "DELETE",
        headers: new Headers({
            "Content-Type": "application/json"
        })
    });
}

export function getNewFileTypes(projectId) {
    return fetch("/api/projects/" + projectId + "/filetypes")
        .then((response) => {
            return response.json();
        });
}