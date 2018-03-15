// Only runs on the server side
const EventEmitter = require('events');
const Path = require('path');
const fs = require('fs-extra');
const Moniker = require('moniker');
const FileStructureTypes = {
    FOLDER: 'folder',
    ITEM: 'item'
};

const PROJECT_TEMPLATES_DIR = Path.join(__dirname, "project-templates");

/**
 * @class ProjectDescription
 * Description of a FTL project, containing low-level details about
 * project type, file system location, etc
 */

class ProjectManager extends EventEmitter {
    constructor(opts) {
        super();

        opts = opts || {};

        this.d_projectFSRoot = opts.fsRoot || Path.resolve(__dirname, "..", "ftl-projects");
        this.d_projects = {}; // Key: Project ID, value, project details
        this.d_templates = [];

        this.reinitialize();
    }

    reinitialize() {
        this.d_readyP = new Promise((resolve, reject) => {
            this.d_projects = {};

            // Do house keeping tasks like grabbing the current list of projects
            this._getAllProjectsInternal()
                .then((projectList) => {
                    projectList.forEach((projectInfo) => {
                        this.d_projects[projectInfo.projectId] = projectInfo;
                    });
                })
                .then(this._getProjectTemplatesInternal)
                .then((projectTemplates) => {
                    this.d_templates = projectTemplates;
                })
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    resolve();
                });
        });
        return this.d_readyP;
    }

    getProjectTemplates() {
        return this.d_readyP
            .then(() => {
                return this.d_templates;
            });
    }

    getAllProjects() {
        return this.d_readyP
            .then(() => {
                var projectList = [];
                Object.keys(this.d_projects).forEach((projectId) => {
                    projectList.push(this.d_projects[projectId]);
                })
                return projectList;
            });
    }

    createProject(projectType) {
        return this.d_readyP
            .then(() => {
                var newProjName = Moniker.choose();
                while (this.d_projects[newProjName]) {
                    newProjName = Moniker.choose();
                }

                return newProjName;
            })
            .then((projId) => {
                // Create the project folder
                const projPath = Path.join(this.d_projectFSRoot, projId);
                return fs.ensureDir(projPath)
                    .then(() => {
                        return {
                            projectId: projId,
                            projectPath: projPath
                        };
                    });
            })
            .then((projInfo) => {
                // Generate the workspace file and template
                return this._createProjectStructure(projInfo.projectId,
                                                    projInfo.projectPath,
                                                    projectType)
                    .then(() => {
                        return {
                            projectId: projInfo.projectId,
                            success: true
                        };
                    });
            })
            .catch((err) => {
                return {
                    projectId: null,
                    success: false,
                    error: err
                };
            });
    }

    getProjectAllFiles(projectId) {
        return this.d_readyP
            .then(() => {
                const projPath = Path.join(this.d_projectFSRoot, projectId);
                return this._getFolderContents(projPath, "/");
            });
    }

    getProjectFile(projectId, projectFilePath) {
        return this.d_readyP
            .then(() => {
                var filePath = Path.join(this.d_projectFSRoot, projectId, projectFilePath);
                
                return fs.readFile(filePath)
                    .then((fileData) => {
                        return {
                            success: true,
                            projectId: projectId,
                            filePath: projectFilePath,
                            contents: fileData.toString()
                        };
                    })
                    .catch((err) => {
                        return {
                            success: false,
                            projectId: projectId,
                            filePath: projectFilePath,
                            error: err
                        };
                    });
            });
    }

    // ==================================================
    // INTERNAL HELPER FUNCTIONS
    // ==================================================
    _getFolderContents(path, relPath) {
        return fs.readdir(path)
            .then((files) => {
                var statPromises = [];
                files.forEach((file) => {
                    var filePath = Path.join(path, file);
                    statPromises.push(fs.stat(filePath));
                });

                return Promise.all(statPromises)
                    .then((statResults) => {
                        var statResultList = [];
                        files.forEach((file, idx) => {
                            statResultList.push({
                                fileName: file,
                                filePath: Path.join(path, file),
                                relPath: Path.join(relPath, file),
                                isDirectory: statResults[idx].isDirectory()
                            });
                        });

                        return statResultList;
                    });
            })
            .then((statResultList) => {
                var finalPromises = [];

                // statResultList is basically an array of files/folders AT THIS PATH
                // we will then iterate on this and finally populate the folder structure
                statResultList.forEach((statResult) => {
                    if (statResult.isDirectory) {
                        // If this is a directory, we add the recursive promise
                        var folderPromise = this._getFolderContents(statResult.filePath, statResult.relPath)
                            .then((folderResults) => {
                                return {
                                    fileName: statResult.fileName,
                                    filePath: statResult.relPath,

                                    children: folderResults,

                                    type: FileStructureTypes.FOLDER,
                                    label: statResult.fileName
                                };
                            });
                        finalPromises.push(folderPromise);
                    }
                    else {
                        // Ignore dotfiles
                        if (statResult.fileName !== '.wkspace') {
                            finalPromises.push({
                                fileName: statResult.fileName,
                                filePath: statResult.relPath,

                                // To match generateTreeNodes
                                type: FileStructureTypes.ITEM,
                                label: statResult.fileName,
                            });
                        }
                        
                    }
                });

                return Promise.all(finalPromises);
            });
    }

    _createProjectStructure(projectId, projectPath, projectType) {
        // create and write the wkspace file
        const wkspaceFilePath = Path.join(projectPath, '.wkspace');
        const wkspaceFileContents = {
            projectId: projectId,
            projectType: projectType
        };

        return fs.writeJson(wkspaceFilePath, wkspaceFileContents, {
                spaces: 4
            })
            .then(() => {
                // Create the project template
                const templateDir = Path.join(PROJECT_TEMPLATES_DIR, projectType, "template");
                return fs.copy(templateDir, projectPath)
                    .catch((err) => {
                        console.log("Could not create project folder: ", err);
                    });
            });
    }

    _getProjectTemplatesInternal() {
        return fs.readdir(PROJECT_TEMPLATES_DIR)
            .then((files) => {
                var statPromises = [];
                files.forEach((filename) => {
                    const filePath = Path.join(PROJECT_TEMPLATES_DIR, filename);
                    var statP = fs.stat(filePath)
                                    .then((stats) => {
                                        return {
                                            fileName: filename,
                                            filePath: filePath,
                                            isDir: stats.isDirectory()
                                        };
                                    })
                                    .catch((err) => {
                                        return {
                                            fileName: filename,
                                            filePath: filePath,
                                            isDir: false
                                        };
                                    });
                    statPromises.push(statP);
                });

                return Promise.all(statPromises);
            })
            .then((statResults) => {
                var templatePromises = [];
                statResults.forEach((statResult) => {
                    if (statResult.isDir) {
                        var templateDescFilePath = Path.join(statResult.filePath, "template.json");
                        var templateDescP = fs.readJson(templateDescFilePath)
                                                .then((templateInfo) => {
                                                    return {
                                                        templateName: statResult.fileName,
                                                        templateDesc: templateInfo.description,
                                                    };
                                                });
                        templatePromises.push(templateDescP);
                    }
                });

                return Promise.all(templatePromises);
            })
            .catch((err) => {
                console.log('err: ', err);
                return [];
            })
    }

    _getAllProjectsInternal() {
        // Create the folder if we haven't already
        return fs.ensureDir(this.d_projectFSRoot)
            .then(() => {
                return fs.readdir(this.d_projectFSRoot)
                    .then((files) => {
                        return files;
                    })
                    .catch((err) => {
                        console.log('ERR in readdir: ', err);
                        return [];
                    });
            })
            .then((files) => {
                var statPromises = [];
                files.forEach((filename) => {
                    const filePath = Path.join(this.d_projectFSRoot, filename);
                    var statP = fs.stat(filePath)
                                    .then((stats) => {
                                        return {
                                            fileName: filename,
                                            filePath: filePath,
                                            isDir: stats.isDirectory(),
                                            aTime: stats.atime,
                                            mTime: stats.mtime,
                                            createTime: stats.birthtime
                                        }
                                    })
                                    .catch((err) => {
                                        return {
                                            fileName: filename,
                                            filePath: filePath,
                                            isDir: false
                                        }
                                    });
                    statPromises.push(statP);
                });
                
                return Promise.all(statPromises);
            })
            .then((files) => {
                var wkspacePromises = [];

                files.forEach((fileInfo) => {
                    if (fileInfo.isDir) {
                        var wkspacePath = Path.join(fileInfo.filePath, ".wkspace");
                        var wkspacePromise = fs.readJson(wkspacePath)
                                                .then((wkspaceObj) => {
                                                    return {
                                                        validProject: true,
                                                        projectId: fileInfo.fileName,
                                                        projectPath: fileInfo.filePath,
                                                        projectType: wkspaceObj.projectType,
                                                        lastAccessed: fileInfo.aTime,
                                                        lastModified: fileInfo.mTime,
                                                        created: fileInfo.createTime
                                                    };
                                                })
                                                .catch((err) => {
                                                    return {
                                                        validProject: false
                                                    };
                                                });
                        wkspacePromises.push(wkspacePromise);
                    }
                });

                return Promise.all(wkspacePromises)
                    .then((wkspaceResults) => {
                        var projectList = [];
                        wkspaceResults.forEach((wkspace) => {
                            if (wkspace.validProject) {
                                delete wkspace.validProject;
                                projectList.push(wkspace);
                            }
                        });
                        return projectList;
                    });
                
            })
            .catch((err) => {
                console.log('ERR in getAllProjects: ', err);
                return [];
            });
    }
}

module.exports = ProjectManager;