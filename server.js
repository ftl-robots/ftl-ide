const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const Moniker = require('moniker');

const app = express();
const router = express.Router();

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

var d_projects = {};

// Set up API routes
// Project routes
router.route('/projects')
    .get((req, res) => {
        res.json(d_projects);
    })
    .post((req, res) => {
        var newName = Moniker.choose();
        console.log(req.body);
        d_projects[newName] = {
            projectName: newName,
            type: req.body.projectType
        };
        res.json({ projectName: newName });
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

app.use('/api', router);

app.listen(process.env.PORT || 8080);