// Only runs on the server side
const EventEmitter = require('events');
const Path = require('path');
const fs = require('fs-extra');
const Moniker = require('moniker');
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
                    resolve();
                })
                .catch((err) => {
                    resolve();
                });
        });
        return this.d_readyP;
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

    getProjectFiles(projectId) {
        return this.d_readyP
            .then(() => {
                const projPath = Path.join(this.d_projectFSRoot, projectId);
                return this._getFolderContents(projPath, "/");
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
                                    children: folderResults
                                };
                            });
                        finalPromises.push(folderPromise);
                    }
                    else {
                        // Ignore dotfiles
                        if (statResult.fileName !== '.wkspace') {
                            finalPromises.push({
                                fileName: statResult.fileName,
                                filePath: statResult.relPath
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
                return fs.writeFile(Path.join(projectPath, "testfile"), "hello")
            });
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
                                            isDir: stats.isDirectory,
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
                // files is an array of stat data
                var projectList = [];
                files.forEach((fileInfo) => {
                    if (fileInfo.isDir) {
                        // TODO one more check: 
                        // Look inside for a .wkspace file
                        projectList.push({
                            projectId: fileInfo.fileName,
                            projectPath: fileInfo.filePath,
                            lastAccessed: fileInfo.aTime,
                            lastModified: fileInfo.mTime,
                            created: fileInfo.createTime
                            // TODO projectType
                        });
                    }
                });

                return projectList;
            })
            .catch((err) => {
                console.log('ERR in getAllProjects: ', err);
                return [];
            });
    }
}

module.exports = ProjectManager;