const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const Moniker = require('moniker');

const ProjectServer = require('./server/project-server');

const app = express();
const router = express.Router();

const projectServer = new ProjectServer();

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
        projectServer.templateManager.getTemplatesAsListP()
            .then((templates) => {
                res.json(templates);
            });
    });

// TemplateInfo
router.route("/templates/:template_name")
    .get((req, res) => {
        projectServer.templateManager.getTemplateInfoP(req.params.template_name)
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
        projectServer.getAllProjects()
            .then((projects) => {
                res.json(projects);
            });
    })
    .post((req, res) => {
        projectServer.createProject(req.body.projectType)
            .then((createProjectStatus) => {
                res.json(createProjectStatus);
            });
    });

router.route('/projects/:project_id')
    .get((req, res) => {
        projectServer.getProjectInfo(req.params.project_id)
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
        projectServer.getValidProjectFileTypes(req.params.project_id)
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
        projectServer.getProjectAllFiles(req.params.project_id)
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
        projectServer.getProjectFile(req.params.project_id, req.params.file_path)
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
            projectServer.createFileFromTemplate(projectId, createPath, req.body.templateName)
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
            projectServer.createFolder(projectId, createPath)
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

        projectServer.updateFileContents(projectId, filePath, req.body.update, req.body.isDiff)
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
            projectServer.deleteFile(projectId, deletePath)
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
            projectServer.deleteFolder(projectId, deletePath)
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