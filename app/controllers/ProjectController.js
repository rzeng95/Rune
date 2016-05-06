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

var async = require('async');

module.exports = function(app, passport) {

    // =====================================
    // PROJECT LIST
    // This will most likely be integrated with the profile screen, but currently exists as a stand-alone page.
    // =====================================
    app.get('/projects', Helper.isLoggedIn, function(req,res) {
        // To get the list of all projects, we parse the variable 'req', which stores the user in the current session
        // (this is handled by passport user authentication). Each User database model contains a list of projects
        // that the user is a member of (See /app/models/user.js). Find the User matching the current user's email,
        // and return the corresponding project list.
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

    // Project creation will probably be done using a pop-up modal object, which can be done via front-end bootstrap magic.
    // Right now it's a separate page of its own located at /createproject
    app.get('/createproject', Helper.isLoggedIn, function(req,res) {
        res.render('createproject.jade', {
            // These are navbar variables
            loggedIn : req.isAuthenticated(),
            projList : req.user.local.projects,
            firstname : req.user.local.firstname
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
        newProject.counter = 0;
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

    // Each project gets its own site with its own unique url. Only logged-in users who are members of that project can access it.
    app.get('/p/:projectid/', Helper.isLoggedIn, Helper.doesProjectExist, Helper.isUserProjectMember, function(req,res) {
        var statuses = app.locals.statuses;
        async.waterfall([
            function createTasks(callback) {
                var tasks = [];
                for(var j=0; j<statuses.length; j++) {
                    tasks[statuses[j]] =[];
                }
                callback(null, tasks)
            },
            // find the Project specified by the accessed URL. We need this for the project's member list
            function getProjectByID(tasks, callback) {
                Project.findById(req.params.projectid, function(err, foundProj){
                    if (err) {
                        callback(err);
                    } else {
                        for(var i=0; i<foundProj.tasks.length; i++)
                        {
                            for(var k=0; k<statuses.length; k++)
                            {
                                if(foundProj.tasks[i].status == statuses[k])
                                {
                                    tasks[statuses[k]].push(foundProj.tasks[i]);
                                    break;
                                }
                            }
                            
                        }
                        callback(null, foundProj, tasks); // Pass the project members list to the next function
                    }
                });
            },
            function getProjectUserInfo(foundProj, tasks, callback) {
                User.find({'local.email': {$in: foundProj.members}}, function(err, foundUsers){
                    if (err) {
                        callback(err);
                    } else {
                        var memberList = [];

                        for (var i=0; i<foundUsers.length; i++) {
                            memberList.push({"name":foundUsers[i].local.firstname+" "+foundUsers[i].local.lastname, "email":foundUsers[i].local.email, "id":foundUsers[i].local.userid});
                        }
                        callback(null, foundProj, tasks, memberList); // Now we pass in the project and the project members list
                    }

                });
            }

        ], function(err,foundProj, tasks, memberList){
            if(err) {
                throw err;
            } else {
                console.log("done waterfalling");
                console.log(tasks);
                res.render('project.jade', {
                    // These are navbar variables
                    loggedIn : req.isAuthenticated(),
                    projList : req.user.local.projects,
                    firstname : req.user.local.firstname,

                    isProjectPage : true,

                    // Overview tab variables
                    projName : foundProj.projectname,
                    projKey : foundProj.projectkey,
                    projId : foundProj.projectid,

                    // User tab variables
                    projMembers : memberList,

                    // Task tab variables
                    taskList : foundProj.tasks,

                    //statuses
                    statuses: statuses,

                    //kanban tab variables
                    tasks1 : tasks[statuses[0]],
                    tasks2 : tasks[statuses[1]],
                    tasks3 : tasks[statuses[2]],
                    tasks4 : tasks[statuses[3]]
                });
            }
        });


    }); //end of app.post('/p/:projectid/')

} // End of module.exports
