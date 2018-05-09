const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const Moniker = require('moniker');

const ProjectManager = require('./server/project-manager');

const app = express();
const router = express.Router();

const projectMgr = new ProjectManager();
projectMgr.getAllProjects()
    .then((projects) => {
        console.log('projects: ', projects);
    })

app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send("hiii");
    //res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Set up API routes
// Template
router.route('/templates')
    .get((req, res) => {
        projectMgr.getProjectTemplates()
            .then((templates) => {
                res.json(templates);
            });
    });

// TemplateInfo
router.route("/templates/:template_name")
    .get((req, res) => {
        projectMgr.getTemplateInfo(req.params.template_name)
            .then((templateInfo) => {
                if (templateInfo) {
                    res.json(templateInfo);
                }
                else {
                    res.status(404)
                        .json({
                            error: "Invalid template '" + req.params.template_name + "'"
                        });
                }
            });
    });

// Project routes
router.route('/projects')
    .get((req, res) => {
        projectMgr.getAllProjects()
            .then((projects) => {
                res.json(projects);
            });
    })
    .post((req, res) => {
        projectMgr.createProject(req.body.projectType)
            .then((createProjectStatus) => {
                res.json(createProjectStatus);
            });
    });

router.route('/projects/:project_id')
    .get((req, res) => {
        projectMgr.getProjectInfo(req.params.project_id)
            .then((projectInfo) => {
                if (!projectInfo.error) {
                    res.json(projectInfo);
                }
                else {
                    res.status(404)
                        .json({
                            error: projectInfo.error
                        });
                }
            })
            .catch((err) => {
                res.status(404)
                    .json({
                        error: err
                    });
            })

    });

router.route("/projects/:project_id/filetypes")
    .get((req, res) => {
        projectMgr.getValidProjectFileTypes(req.params.project_id)
            .then((validFileTypes) => {
                res.json(validFileTypes);
            })
            .catch((err) => {
                res.status(404)
                    .json({
                        error: err
                    });
            });
    })

router.route('/projects/:project_id/files')
    .get((req, res) => {
        projectMgr.getProjectAllFiles(req.params.project_id)
            .then((files) => {
                res.json(files);
            })
            .catch((err) => {
                res.status(404)
                    .json([]);
            })
    });

router.route('/projects/:project_id/files/:file_path')
    .get((req, res) => {
        projectMgr.getProjectFile(req.params.project_id, req.params.file_path)
            .then((fileInfo) => {
                if (fileInfo.success) {
                    res.json({
                        projectId: fileInfo.projectId,
                        filePath: fileInfo.filePath,
                        contents: fileInfo.contents
                    });
                }
                else {
                    res.status(404)
                        .json({
                            projectId: fileInfo.projectId,
                            filePath: fileInfo.filePath,
                            error: fileInfo.error
                        });
                }
            })
            .catch((err) => {
                res.status(404)
                    .json({
                        projectId: req.params.project_id,
                        filePath: req.params.file_path,
                        error: err
                    });
            });
    })
    .post((req, res) => {
        // TODO this handles the CREATION of a new file or folder
        const projectId = req.params.project_id;
        const createPath = req.params.file_path;
        if (req.body.createType === "file") {
            projectMgr.createFileFromTemplate(projectId, createPath, req.body.templateName)
                .then((result) => {
                    if (result.success) {
                        res.json({
                            success: true
                        });
                    }
                    else {
                        res.status(403)
                            .json({
                                success: false,
                                error: result.error
                            });
                    }
                })
                .catch((err) => {
                    res.status(403)
                        .json({
                            success: false,
                            error: err
                        });
                });
        }
        else if (req.body.createType === "folder") {
            projectMgr.createFolder(projectId, createPath)
            .then((result) => {
                if (result.success) {
                    res.json({
                        success: true
                    });
                }
                else {
                    res.status(403)
                        .json({
                            success: false,
                            error: result.error
                        });
                }
            })
            .catch((err) => {
                res.status(403)
                    .json({
                        success: false,
                        error: result.error
                    });
            });
        }
        else {
            res.status(403)
                .json({
                    success: false,
                    error: "Invalid createType"
                });
        }

    })
    .put((req, res) => {
        const projectId = req.params.project_id;
        const filePath = req.params.file_path

        projectMgr.updateFileContents(projectId, filePath, req.body.update, req.body.isDiff)
            .then((results) => {
                if (results.success) {
                    res.json({
                        success: true
                    });
                }
                else {
                    res.status(500)
                        .json({
                            success: false,
                            error: err
                        });
                }
            })
            .catch((err) => {
                res.status(500)
                    .json({
                        success: false,
                        error: err
                    });
            })

    })
    .delete((req, res) => {
        const projectId = req.params.project_id;
        const deletePath = req.params.file_path;
        if (req.body.deleteType === "file") {
            projectMgr.deleteFile(projectId, deletePath)
                .then((result) => {
                    if (result.success) {
                        res.json({
                            success: true
                        });
                    }
                    else {
                        res.status(403)
                            .json({
                                success: false,
                                error: result.error
                            });
                    }
                })
                .catch((err) => {
                    res.status(403)
                        .json({
                            success: false,
                            error: err
                        });
                });
        }
        else if (req.body.deleteType === "folder") {
            projectMgr.deleteFolder(projectId, deletePath)
                .then((result) => {
                    if (result.success) {
                        res.json({
                            success: true
                        });
                    }
                    else {
                        res.status(403)
                            .json({
                                success: false,
                                error: result.error
                            });
                    }
                })
                .catch((err) => {
                    res.status(403)
                        .json({
                            success: false,
                            error: err
                        });
                });
        }
        else {
            res.status(403)
                .json({
                    success: false,
                    error: "Invalid createType"
                });
        }
    })

app.use('/api', router);

app.listen(process.env.PORT || 8080);