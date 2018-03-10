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

// API definition
app.get('/ping', function (req, res) {
    return res.send('pong');
});

app.get('/', function (req, res) {
    res.send("hiii");
    //res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

var d_projects = {
    "test-wkspace": {
        projectName: 'test-wkspace',
        type: 'java-project'
    }
};

// Set up API routes
// Template
router.route('/templates')
    .get((req, res) => {
        projectMgr.getProjectTemplates()
            .then((templates) => {
                res.json(templates);
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
        console.log('Retrieving ' + req.params.project_id);
        var project = d_projects[req.params.project_id];
        if (project) {
            res.json(project);
        }
        else {
            res.status(404).json({
                error: "Invalid Project ID"
            });
        }
    });

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
    })
    .put((req, res) => {
        // TODO This handles the UPDATE of a file
        // This should handle either diffs or full on update
    })
    .delete((req, res) => {
        // TODO This handles the DELETION of a file or folder
    })

app.use('/api', router);

app.listen(process.env.PORT || 8080);