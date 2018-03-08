// Only runs on the server side
const EventEmitter = require('events');
const Path = require('path');
const fs = require('fs-extra');

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
            })
    }

    // ==================================================
    // INTERNAL HELPER FUNCTIONS
    // ==================================================
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