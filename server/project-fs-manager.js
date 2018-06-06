const Path = require("path");
const fs = require("fs-extra");

const FileStructureTypes = {
    FOLDER: 'folder',
    ITEM: 'item'
};

class ProjectFileSystemManager {
    constructor(fsRoot) {
        this.d_projectFSRoot = fsRoot;

        this.reinitialize();
    }

    reinitialize() {
        this.d_readyP = new Promise((resolve) => {
            fs.ensureDir(this.d_projectFSRoot)
                .then(() => {
                    resolve();
                })
        });

        return this.d_readyP;
    }

    initializeProjectSpace(projectId) {
        return this.d_readyP
            .then(() => {
                const projPath = Path.join(this.d_projectFSRoot, projectId);
                return fs.ensureDir(projPath)
                    .then(() => {
                        return {
                            projectId: projectId,
                            projectPath: projPath
                        };
                    });
            });
    }

    writeWkspaceFile(projectId, wkspaceFileJson) {
        return this.d_readyP
            .then(() => {
                const wkspaceFilePath = Path.join(this.d_projectFSRoot, projectId, ".wkspace");

                return fs.writeJson(wkspaceFilePath, wkspaceFileJson, {
                    spaces: 4
                });
            });
    }

    copyTemplateContents(projectId, templatePath) {
        const projPath = Path.join(this.d_projectFSRoot, projectId);
        return this.__copyTemplate(projPath, templatePath);
    }

    getAllProjectsP() {
        return this.d_readyP
            .then(this.__getProjectListWithFileStats.bind(this))
            .then((pListWithStats) => {
                var infoPromises = [];
                pListWithStats.forEach((pInfoWithStats, idx) => {
                    var wkspPromise = this.getProjectWorkspaceInfoP(pInfoWithStats.fileName)
                            .then((wkspInfo) => {
                                if (wkspInfo) {
                                    return {
                                        validProject: true,
                                        projectId: pInfoWithStats.fileName,
                                        projectPath: pInfoWithStats.filePath,
                                        projectType: wkspInfo.projectType,
                                        lastAccessed: pInfoWithStats.aTime,
                                        lastModified: pInfoWithStats.mTime,
                                        created: pInfoWithStats.createTime
                                    };
                                }
                                else {
                                    return {
                                        validProject: false
                                    };
                                }
                            });
                    infoPromises.push(wkspPromise);
                });

                return Promise.all(infoPromises)
                    .then((roughProjectList) => {
                        var projectList = [];
                        roughProjectList.forEach((proj) => {
                            if (proj.validProject) {
                                projectList.push(proj);
                            }
                        });

                        return projectList;
                    })
            });
    }

    getProjectWorkspaceInfoP(projectId) {
        const wkspaceFilePath = Path.join(this.d_projectFSRoot, projectId, ".wkspace");

        return this.d_readyP
            .then(() => {
                return fs.readJson(wkspaceFilePath)
                    .then((wkspaceObj) => {
                        return wkspaceObj;
                    })
                    .catch((err) => {
                        console.error("Could not get workspace info: ", err);
                        return null;
                    })
            });
    }

    getProjectFileListP(projectId) {
        return this.__getProjectSrcDir(projectId)
            .then((realSrcDir) => {
                return this.__getFolderContentsRelative(realSrcDir, "/");
            });
    }

    readProjectFileP(projectId, relFilePath) {
        return this.__getProjectSrcDir(projectId)
            .then((realSrcDir) => {
                const filePath = Path.join(realSrcDir, relFilePath);

                return fs.readFile(filePath)
                    .then((fileData) => {
                        return {
                            success: true,
                            projectId: projectId,
                            filePath: relFilePath,
                            contents: fileData.toString()
                        };
                    })
                    .catch((err) => {
                        return {
                            success: false,
                            projectId: projectId,
                            filePath: relFilePath,
                            error: err
                        };
                    })
            })
    }

    writeProjectFileP(projectId, relFilePath, contents) {
        return this.__getProjectSrcDir(projectId)
            .then((realSrcDir) => {
                const savePath = Path.join(realSrcDir, relFilePath);
                return fs.writeFile(savePath, contents)
                    .then(() => {
                        return {
                            success: true
                        };
                    });
            })
            .catch((err) => {
                return {
                    success: false,
                    error: err
                };
            });
    }

    createProjectFolder(projectId, folderPath) {
        return this.__getProjectSrcDir(projectId)
            .then((realSrcDir) => {
                const newFolderPath = Path.join(realSrcDir, folderPath);
                return fs.mkdir(newFolderPath)
                    .then(() => {
                        return {
                            success: true
                        };
                    })
                    .catch((err) => {
                        return {
                            success: false,
                            error: err
                        };
                    });
            });
    }

    deleteProjectFolder(projectId, folderPath) {
        return this.__getProjectSrcDir(projectId)
            .then((realSrcDir) => {
                const delFolderPath = Path.join(realSrcDir, folderPath);
                return fs.rmdir(delFolderPath)
                    .then(() => {
                        return {
                            success: true
                        };
                    })
                    .catch((err) => {
                        return {
                             success: false,
                             error: err
                        };
                    });
            });
    }

    deleteProjectFile(projectId, filePath) {
        return this.__getProjectSrcDir(projectId)
            .then((realSrcDir) => {
                const delFilePath = Path.join(realSrcDir, filePath);
                return fs.unlink(delFilePath)
                    .then(() => {
                        return {
                            success: true
                        };
                    })
                    .catch((err) => {
                        return {
                            success: false,
                            error: err
                        };
                    });
            });
    }

    // ============= PRIVATE HELPER METHODS ==================

    /**
     * Return a list of toplevel project IDs
     */
    __getProjectListWithFileStats() {
        return fs.ensureDir(this.d_projectFSRoot)
            .then(() => {
                return fs.readdir(this.d_projectFSRoot)
                    .then((files) => {
                        return files;
                    })
                    .catch((err) => {
                        console.warn("ERR in readdir: ", err);
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
            .then((fileList) => {
                var results = [];
                fileList.forEach((fileInfo) => {
                    if (fileInfo.isDir) {
                        results.push(fileInfo);
                    }
                });

                return results;
            });
    }

    __getProjectSrcDir(projectId) {
        return this.getProjectWorkspaceInfoP(projectId)
            .then((wkspaceInfo) => {
                const srcDir = wkspaceInfo.srcDir || ".";
                const projectRoot = Path.join(this.d_projectFSRoot, projectId);
                const projectSrcDir = Path.resolve(projectRoot, srcDir);

                return projectSrcDir;
            });
    }

    __copyTemplate(targetDir, templateDir) {
        return fs.copy(templateDir, targetDir)
            .catch((err) => {
                console.error("Could not copy template: ", err);
            });
    }

    /**
     * Read the contents of a folder and return relative paths
     * @param {string} path Actual Filesystem path to read
     * @param {string} relPath Relative path to start from
     */
    __getFolderContentsRelative(path, relPath) {
        return fs.readdir(path)
            .then((pFiles) => {
                var statPromises = [];
                pFiles.forEach((pFile) => {
                    var filePath = Path.join(path, pFile);
                    statPromises.push(fs.stat(filePath));
                });

                return Promise.all(statPromises)
                    .then((statResults) => {
                        var statResultList = [];
                        pFiles.forEach((pFile, idx) => {
                            statResultList.push({
                                fileName: pFile,
                                filePath: Path.join(path, pFile),
                                relPath: Path.join(relPath, pFile),
                                isDirectory: statResults[idx].isDirectory()
                            });
                        });

                        return statResultList;
                    });
            })
            .then((statResultList) => {
                var finalPromises = [];

                // statResultList is basically an array of files/folders AT THIS PATH
                // We will then iterate on this and finally populate the folder structure
                statResultList.forEach((statResult) => {
                    if (statResult.isDirectory) {
                        // If this is a directory, we add the recursive promise
                        var folderPromise = this.__getFolderContentsRelative(statResult.filePath, statResult.relPath)
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
                        // ignore dotfiles
                        if (statResult.fileName !== ".wkspace") {
                            finalPromises.push({
                                fileName: statResult.fileName,
                                filePath: statResult.relPath,
                                type: FileStructureTypes.ITEM,
                                label: statResult.fileName
                            });
                        }
                    }
                });

                return Promise.all(finalPromises);
            });
    }
};

module.exports = ProjectFileSystemManager;