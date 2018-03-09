export function getProjects() {
    return fetch('/api/projects');
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