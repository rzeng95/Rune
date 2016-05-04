/**
 *
 * ProjectController handles individual project pages, project creation, and task management
 * This is the largest controller file, and can possibly be broken into ProjectController & TaskController
 *
 **/

var User = require('../models/user.js');
var Project = require('../models/project.js');
var Task = require('../models/task.js');

var Helper = require('../models/helpers.js');

module.exports = function(app, passport) {

    // =====================================
    // PROJECT LIST
    // This will most likely be integrated with the profile screen, but currently exists as a stand-alone page.
    // =====================================

    app.get('/projects', Helper.isLoggedIn, function(req,res) {
        // To get the list of all projects, we parse the variable 'req', which stores the user in the current session (this is handled by passport user authentication)
        // Each User database model contains a list of projects that the user is a member of (See /app/models/user.js).
        // Find the User matching the current user's email, and return the corresponding project list
        User.findOne({'local.email': req.user.local.email}, function(err,user) {
            if (err) {
                throw err;
            } else {
                var projectList = user.local.projects;
                res.render('projects.jade', {
                    user : req.user,
                    projlist : projectList,
                    loggedIn : req.isAuthenticated()
                });
            }
        });
    });



    // Render the kanban page.
    app.get('/kanban', function(req, res) {
        var firstname = '';
        var projectList = [];
        if (req.isAuthenticated()) {
            firstname = req.user.local.firstname;
            projectList = req.user.local.projects;
        }
        res.render('kanban.jade', {

            // These are navbar variables
            loggedIn : req.isAuthenticated(),
            projList : projectList,
            firstname : firstname,

            message : req.flash('loginMessage'),   // handle errors with logging in

        });
    });


    // Project creation will probably be done using a pop-up modal object, which can be done via front-end bootstrap magic. Right now it's a separate page of its own located at /createproject
    app.get('/createproject', Helper.isLoggedIn, function(req,res) {
        res.render('createproject.jade', {
            // These are navbar variables
            loggedIn : req.isAuthenticated(),
            projList : req.user.local.projects,
            firstname : req.user.local.firstname,

        });
    });

    app.post('/createproject', Helper.isLoggedIn, function(req,res) {

        // Three things need to happen when a project is created:
        // 1. The project must contain the name and other relevant details passed to it from the web form
        // 2. The current logged-in user must automatically added to the project's member list
        // 3. The current logged-in user's database entry must be modified to add the project id to the user's "project" list
        var rawProjectName = req.body.projectname;
        var projectName = rawProjectName.trim();;
        var projectKey = rawProjectName.replace(/\s+/g, "").substring(0,4).toUpperCase();
        var userEmail = req.user.local.email;

        // Add the user's email to the project's "members" array
        var newProject = new Project();
        newProject.projectname = projectName;
        newProject.projectkey = projectKey;
        newProject.projectid = (newProject._id).toString();
        newProject.members.push(userEmail);
        newProject.save(function(err) {
            if (err) {
                throw err;
            } else {
                var projectUrl = newProject.projectid;
                console.log('project created ');
            }
        });

        // Add this project's ID to the user's "projects" array
        User.findOne({'local.email': userEmail}, function(err,user) {
            if (err) {
                throw err;
            } else if (!user) {
                req.flash('errorMessage', 'Something pretty bad happened...');
                res.redirect('/error');
            } else {

                user.local.projects.push({
                    projectkey : projectKey,
                    projectid : (newProject.projectid).toString()
                });
                user.save(function(err) {
                    console.log('project added to user');
                    res.redirect('/p/'+newProject.projectid+'/');
                });
            }
        });


    });

    // Right now, task creation is handled through a separate web form
    // This can probably be handled later by front-end pop-up modal
    app.get('/p/:projectid/createtask/', Helper.isLoggedIn, Helper.doesProjectExist, Helper.isUserProjectMember, function(req,res) {
        res.render('createtask.jade', {
            // These are navbar variables
            loggedIn : req.isAuthenticated(),
            projList : req.user.local.projects,
            firstname : req.user.local.firstname,

        });
    });

    app.post('/p/:projectid/createtask', Helper.isLoggedIn, Helper.isUserProjectMember, function(req,res) {
        console.log("\n\n==============");
        console.log("Project ID: " + req.params.projectid);
        console.log("User: " + req.user.local);
        console.log("Form Parameters: " + req.body.taskname + " , " + req.body.taskdescription + " , " + req.body.assignedto + " , " + req.body.status + " , " + req.body.priority);
        console.log("==============\n\n");
        // We want to create a new Task object (see models/task.js)
        // To see how mongoose creates and saves objects, see app.post('/createproject') endpoint
        // make sure the current logged in user (saved under req.user.local) is the "reporter" of the task
        // Make sure the project key (e.g. JIRA) is appended to the task ID (so our task ID is called JIRA-649 for example)

        var newTask = new Task();
        newTask.projectid = req.params.projectid;
        newTask.taskname = req.body.taskname;
        newTask.taskid = 1;
        newTask.taskdescription = req.body.taskdescription;
        newTask.createdby = req.user.local.firstname + ' ' + req.user.local.lastname;
        newTask.assignedto = req.body.assignedto;
        newTask.status = req.body.status;
        newTask.datecreated = new Date().toJSON().slice(0,10);
        newTask.priority = req.body.priority;
        newTask.issuetype = req.body.issuetype;

        newTask.save(function(err) {
            if (err) {
                throw err;
            } else {
                console.log('task created ');
            }
        });

        res.redirect('/p/' + req.params.projectid + '/');
    });

    // Each project gets its own site with its own unique url. Only logged-in users who are members of that project can access it.
    app.get('/p/:projectid/', Helper.isLoggedIn, Helper.doesProjectExist, Helper.isUserProjectMember, function(req,res) {
        var projectId = req.params.projectid;
        // Knowing the project id because it's passed in by the url, the entire project database entry can be accessed using mongoose's findById method
        Project.findById(projectId, function(err, proj) {
            if (err) {
                throw err;
            } else {
                res.render('project.jade', {
                    // These are navbar variables
                    loggedIn : req.isAuthenticated(),
                    projList : req.user.local.projects,
                    firstname : req.user.local.firstname,

                    // These are project variables
                    projName : proj.projectname,
                    projKey : proj.projectkey,
                    projId : proj.projectid,
                    projMembers : proj.members,
                    isProjectPage : true
                });
            }
        });
    });

/*
    app.post('/p/:projectid', isLoggedIn, doesProjectExist, isUserProjectMember, function(req,res) {
        //handle creating new tasks

    });

    app.get('/p/:projectid/:taskid', isLoggedIn, doesProjectExist, isUserProjectMember, function(req,res) {

    });
*/
}; // End of module.exports
