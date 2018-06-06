// Only runs on the server side
const EventEmitter = require('events');
const Path = require('path');
const fs = require('fs-extra');
const Moniker = require('moniker');
const Diff = require('diff');

const TemplateManager = require("./template-manager");
const ProjectFileSystemManager = require("./project-fs-manager");
const Utils = require("./utils");



const PROJECT_TEMPLATES_DIR = Path.join(__dirname, "project-templates");

/**
 * @class ProjectDescription
 * Description of a FTL project, containing low-level details about
 * project type, file system location, etc
 */

class ProjectServer extends EventEmitter {
    constructor(opts) {
        super();

        opts = opts || {};

        this.d_projectFSRoot = opts.fsRoot || Path.resolve(__dirname, "..", "ftl-projects");
        this.d_projects = {}; // Key: Project ID, value, project details

        // Template manager
        this.d_templateMgr = new TemplateManager(PROJECT_TEMPLATES_DIR);

        this.d_fsMgr = new ProjectFileSystemManager(this.d_projectFSRoot);

        this.reinitialize();

        // TEST
    }

    reinitialize() {
        this.d_readyP = new Promise((resolve, reject) => {
            this.d_projects = {};

            // Do house keeping tasks like grabbing the current list of projects
            this.d_fsMgr.getAllProjectsP()
                .then((projectList) => {
                    projectList.forEach((projectInfo) => {
                        this.d_projects[projectInfo.projectId] = projectInfo;
                    });
                })
                // Wait for the template manager to be ready
                .then(this.d_templateMgr.readyP)
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    resolve();
                });
        });
        return this.d_readyP;
    }

    get templateManager() {
        return this.d_templateMgr;
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
                return this.d_fsMgr.initializeProjectSpace(projId)
            })
            .then((projInfo) => {
                // Get template info (for srcDir), and copy over the templates
                return this.d_templateMgr.getTemplateInfoP(projectType)
                    .then((templateInfo) => {
                        if (!templateInfo) {
                            throw "Invalid template name provided";
                        }

                        const wkspaceFileContents = {
                            projectId: projInfo.projectId,
                            projectType: projectType,
                            srcDir: templateInfo.srcDir
                        };

                        return this.d_fsMgr.writeWkspaceFile(projInfo.projectId, wkspaceFileContents)
                            .then(() => {
                                return this.d_templateMgr.getTemplatePathP(projectType)
                                    .then((templatePath) => {
                                        return this.d_fsMgr.copyTemplateContents(projInfo.projectId, templatePath);
                                    });
                            })
                            .then(this.reinitialize.bind(this))
                            .then(() => {
                                return {
                                    projectId: projInfo.projectId,
                                    success: true
                                };
                            });
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
                return this.d_fsMgr.getProjectFileListP(projectId);
            });
    }

    getProjectFile(projectId, projectFilePath) {
        return this.d_readyP
            .then(() => {
                return this.d_fsMgr.readProjectFileP(projectId, projectFilePath);
            });
    }

    getProjectInfo(projectId) {
        return this.d_readyP
            .then(() => {
                if (!this.d_projects[projectId]) {
                    return Promise.reject("Could not find project '" + projectId + "'");
                }

                const projectInfo = this.d_projects[projectId];
                return this.getProjectAllFiles(projectId)
                    .then((projectFiles) => {
                        return {
                            projectId: projectInfo.projectId,
                            projectType: projectInfo.projectType,
                            files: projectFiles
                        }
                    })
                    .catch((err) => {
                        return {
                            error: err
                        }
                    })
            })
    }

    updateFileContents(projectId, filePath, update, isDiff) {
        return this.d_readyP
            .then(() => {
                return this.d_fsMgr.writeProjectFileP(projectId, filePath, update);
            });
    }

    createFolder(projectId, folderPath) {
        return this.d_readyP
            .then(() => {
                return this.d_fsMgr.createProjectFolder(projectId, folderPath);
            });
    }

    deleteFolder(projectId, folderPath) {
        return this.d_readyP
            .then(() => {
                return this.d_fsMgr.deleteProjectFolder(projectId, folderPath);
            });
    }

    deleteFile(projectId, filePath) {
        return this.d_readyP
            .then(() => {
                return this.d_fsMgr.deleteProjectFile(projectId, filePath);
            });
    }

    createFileFromTemplate(projectId, filePath, fileTemplateType) {
        return this.getProjectInfo(projectId)
            .then((projInfo) => {
                return this.d_templateMgr.getTemplateFileP(projInfo.projectType, fileTemplateType)
                    .then((templateContents) => {
                        // Set up the regex replacements
                        var replacementInputs = {
                            fileDirname: Path.dirname(filePath),
                            fileExt: Path.extname(filePath),
                            fileName: Path.basename(filePath, Path.extname(filePath))
                        };

                        var replacements = Utils.generateTemplateReplacements(replacementInputs);
                        // Do replacements
                        Object.keys(replacements).forEach((placeholder) => {
                            var replacementVal = replacements[placeholder];
                            var matcher = new RegExp(placeholder, "g");
                            templateContents = templateContents.replace(matcher, replacementVal);
                        });

                        return this.d_fsMgr.writeProjectFileP(projectId, filePath, templateContents);
                    });
            });

    }

    getValidProjectFileTypes(projectId) {
        return this.d_readyP
            .then(() => {
                // Find the project type
                const projInfo = this.d_projects[projectId];
                if (projInfo) {
                    return this.d_templateMgr.getTemplateInfoP(projInfo.projectType)
                        .then((templateInfo) => {
                            if (templateInfo) {
                                return templateInfo.newFileTypes;
                            }
                            else {
                                return [];
                            }
                        });
                }
                else {
                    throw "No project info found for '" + projectId + "'";
                }
            });
    }

    // ==================================================
    // INTERNAL HELPER FUNCTIONS
    // ==================================================


}

module.exports = ProjectServer;