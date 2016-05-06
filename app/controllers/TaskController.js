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
                var userslist = [];
                User.find({
                    'local.email' : {
                        $in : proj.members
                    }
                }, function(err, users) {
                    if (err) {
                        throw err;
                    }
                    async.waterfall([
                        function(callback) {
                            var userslist = [];
                            for (var i = 0; i < users.length; i++) {
                                userslist.push({
                                    "name" : users[i].local.firstname + " " + users[i].local.lastname,
                                    "email" : users[i].local.email
                                });
                            }
                            callback(null, userslist);
                        },
                        function(userslist, callback) {
                            res.render('includes/createtask.jade', {
                                // These are navbar variables
                                loggedIn : req.isAuthenticated(),
                                projList : req.user.local.projects,
                                firstname : req.user.local.firstname,
                                usersList : userslist,
                                statuses : app.locals.statuses
                            })
                        }
                    ])
                });
            }
        });
    });

    app.post('/p/:projectid/createtask', Helper.isLoggedIn, Helper.doesProjectExist, Helper.isUserProjectMember, function(req, res) {
        // We want to create a new Task object (see models/task.js)
        // To see how mongoose creates and saves objects, see app.post('/createproject') endpoint
        // make sure the current logged in user (saved under req.user.local) is the "reporter" of the task
        // Make sure the project key (e.g. JIRA) is appended to the task ID (so our task ID is called JIRA-649 for example)
        Project.findById(req.params.projectid, function(err, foundProj){
            if (err) {
                throw err;
            } else {
                foundProj.counter++;
                //console.log(foundProj.counter);
                //console.log( foundProj.projectkey + '-' + Helper.zeroPad(foundProj.counter, 3));
                foundProj.tasks.push({
                    projectid       :   req.params.projectid,
                    taskname        :   req.body.taskname,
                    taskid          :   foundProj.projectkey + '-' + Helper.zeroPad(foundProj.counter, 3),
                    taskdescription :   req.body.taskdescription,
                    createdby       :   req.user.local.firstname + ' ' + req.user.local.lastname,
                    assignedto      :   req.body.assignedto,
                    status          :   req.body.status,
                    datecreated     :   new Date().toDateString(),
                    priority        :   req.body.priority,
                    issuetype       :   req.body.issuetype
                });
                foundProj.save(function(err) {
                    console.log('project updated with new task');
                    res.redirect('/p/' + req.params.projectid + '/');
                });
            }
        });
    });

    app.post('/p/:projectid/movetask/', function(req, res) {
        async.waterfall([
            function findProject(callback) {
                Project.findById(req.params.projectid, function(err, foundProj) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, foundProj);
                    }
                });
            },
            function searchForTask(foundProj, callback) {
                var taskList = foundProj.tasks;
                for (var i = 0; i < taskList.length; i++) {
                    console.log(taskList[i].taskid + ' ' + req.params.taskid)
                    if (taskList[i].taskid == req.params.taskid) {
                        var foundTask = taskList[i];
                        console.log('found task');
                        return callback(null, foundProj, foundTask);
                    }
                }
                console.log('couldn\'t find task');
                callback(1);
            }
        ], function(err, foundProj, foundTask) {
            if (err) {
                if (err == 1) {
                    console.log('couldn\'t find task');
                }
                res.send('error');
            } else {
                foundTask.status = app.locals.statuses[req.params.status];
                foundProj.save(function(err2,done) {
                    if (err2) {
                        throw err2;
                    } else {
                        console.log('project created');
                        res.send('done');
                    }
                });
            }
        });
    });

} // End of module exports
