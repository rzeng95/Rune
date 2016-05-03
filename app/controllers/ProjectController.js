/**
 *
 * ProjectController handles individual project pages, project creation, and task management
 * This is the largest controller file, and can possibly be broken into ProjectController & TaskController
 *
 **/

var User = require('../models/user.js');
var Project = require('../models/project.js');
var Task = require('../models/task.js');

module.exports = function(app, passport) {

    // =====================================
    // PROJECT LIST
    // This will most likely be integrated with the profile screen, but currently exists as a stand-alone page.
    // =====================================

    app.get('/projects', isLoggedIn, function(req,res) {
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
            firstname : firstname,
            loggedIn : req.isAuthenticated(), // if not logged in, display the login form
            message : req.flash('loginMessage'),   // handle errors with logging in
            projList : projectList
        });
    });


    // Project creation will probably be done using a pop-up modal object, which can be done via front-end bootstrap magic. Right now it's a separate page of its own located at /createproject
    app.get('/createproject', isLoggedIn, function(req,res) {
        res.render('createproject.jade', {
            firstname : req.user.local.firstname,
            loggedIn : req.isAuthenticated()
        });
    });

    app.post('/createproject', isLoggedIn, function(req,res) {
        // Three things need to happen when a project is created:
        // 1. The project must contain the name and other relevant details passed to it from the web form
        // 2. The current logged-in user must automatically added to the project's member list
        // 3. The current logged-in user's database entry must be modified to add the project id to the user's "project" list
        var projectName = req.body.projectname;
        var projectKey = req.body.projectkey;
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
                //user.local.projectNames.push((newProject.projectname).toString());
                //user.local.projectIDs.push((newProject.projectid).toString());

                //user.local.projectkeys.push( projectKey );
                //user.local.projectids.push( (newProject.projectid).toString() );
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
    app.get('/p/:projectid/createtask', isLoggedIn, doesProjectExist, isUserProjectMember, function(req,res) {
        res.render('createtask.jade');
    });

    app.post('/p/:projectid/createtask', isLoggedIn, isUserProjectMember, function(req,res) {
        var newTask = new Task();
    });

    // Each project gets its own site with its own unique url. Only logged-in users who are members of that project can access it.
    app.get('/p/:projectid/', isLoggedIn, doesProjectExist, isUserProjectMember, function(req,res) {
        var projectId = req.params.projectid;
        // Knowing the project id because it's passed in by the url, the entire project database entry can be accessed using mongoose's findById method
        Project.findById(projectId, function(err, proj) {
            if (err) {
                throw err;
            } else {
                res.render('project.jade', {
                    projName : proj.projectname,
                    projId : proj.projectid,
                    projMembers : proj.members,
                    loggedIn : req.isAuthenticated(),
                    firstname: req.user.local.firstname,
                    isProjectPage : true,
                });
            }
        });
    });

    app.post('/p/:projectid', isLoggedIn, doesProjectExist, isUserProjectMember, function(req,res) {
        //handle creating new tasks

    });

    app.get('/p/:projectid/:taskid', isLoggedIn, doesProjectExist, isUserProjectMember, function(req,res) {

    });

};

// Check if user is logged in, redirect to error page if they aren't
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
         res.redirect('/login');
    }
}

function isUserProjectMember(req,res,next) {
    //Find the current user and make sure they're part of the project being accessed
    Project.findOne({'members': req.user.local.email, 'projectid': req.params.projectid}, function(err,user) {
        if (err) {
            throw err;
        } else if (!user) {
            req.flash('errorMessage', 'Not a member of project');
            res.redirect('/error');
        } else {
            return next();
        }
    });
}

function doesProjectExist(req,res,next) {
    //Make sure that if the project url is manually entered, that it exists
    Project.findOne({'projectid': req.params.projectid}, function(err,proj){
        if (err) {
            throw err;
        } else if (!proj) {
            req.flash('errorMessage', 'Project does not exist');
            res.redirect('/error');
        } else {
            return next();
        }
    });
}
