/*
 * TaskController controls anything related to task management
*/

var User = require('../models/user.js');
var Project = require('../models/project.js');
var Task = require('../models/task.js');

var Helper = require('../models/helpers.js');

var async = require('async');

module.exports = function(app, passport) {

    // Right now, task creation is handled through a separate web form
    // This can probably be handled later by front-end pop-up modal
    app.get('/p/:projectid/createtask/', Helper.isLoggedIn, Helper.doesProjectExist, Helper.isUserProjectMember, function(req,res) {
        
        Project.findById(req.params.projectid, function(err, proj) {
            if (err) {
                throw err;
            } else {
                User.find({'local.email':proj.members}, function(err, users)
                {
                    
                    async.waterfall([
                        function(callback) {
                            var userslist = [];
                            console.log("TEST");
                            for(var i=0; i<users.length; i++)
                            {
                                userslist.push({"name":users[i].local.firstname+" "+users[i].local.lastname, "email":users[i].local.email})
                            }
                            callback(null, userslist);
                        },

                        function(userslist, callback){
                            console.log(userslist);
                            res.render('createtask.jade', {
                                // These are navbar variables
                                loggedIn : req.isAuthenticated(),
                                projList : req.user.local.projects,
                                firstname : req.user.local.firstname,
                                usersList: userslist
                            })
                        }
                        ])

                       
                });
                    
                
            }
        });


    });

    app.post('/p/:projectid/createtask', Helper.isLoggedIn, Helper.isUserProjectMember, function(req,res) {
        console.log("\n\n==============");
        console.log("Project ID: " + req.params.projectid);
        console.log("User: " + req.user.local);
        console.log("Form Parameters: " + req.body.taskname + " , " + req.body.taskdescription);
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


} // End of module exports
