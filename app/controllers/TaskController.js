/*
 * TaskController controls anything related to task management
*/

var User = require('../models/user.js');
var Project = require('../models/project.js');
//var Task = require('../models/task.js');
var Helper = require('../models/helpers.js');
var async = require('async');

module.exports = function(app, passport) {

    // Task creation is handled through a front-end pop-up modal.
    app.get('/p/:projectid/createtask/', Helper.isLoggedIn, Helper.doesProjectExist,
            Helper.isUserProjectMember, Helper.isAjaxRequest, function(req, res) {
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
                            res.render('includes/task/create.jade', {
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

    // Task creation POST request.
    app.post('/p/:projectid/createtask', Helper.isLoggedIn, Helper.doesProjectExist, Helper.isUserProjectMember, function(req, res) {
        // We want to create a new Task object (see models/task.js)
        // To see how mongoose creates and saves objects, see app.post('/createproject') endpoint
        // make sure the current logged in user (saved under req.user.local) is the "reporter" of the task
        // Make sure the project key (e.g. JIRA) is appended to the task ID (so our task ID is called JIRA-649 for example)
        Project.findById(req.params.projectid, function(err, foundProj) {
            if (err) {
                throw err;
            } else {
                foundProj.counter++;
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
                    res.redirect('/p/' + req.params.projectid + '/');
                });
            }
        });
    });

    // A Task page GET request.
    app.get('/p/:projectid/t/:taskid/', Helper.isLoggedIn, Helper.doesProjectExist, Helper.isUserProjectMember, function(req, res) {
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
                    if (taskList[i].taskid == req.params.taskid) {
                        var foundTask = taskList[i];
                        return callback(null, foundProj, foundTask);
                    }
                }
                callback(1);
            },
            function getUsersList(foundProj, foundTask, callback) {
                Helper.getProjectMemberList(req.params.projectid, function(err,usersList) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, foundProj, foundTask, usersList);
                    }
                });
            }
        ],
        function(err, foundProj, foundTask, usersList) {
            if (err) {
                res.send('error');
            } else {
                foundProj.save(function(err2, done) {
                    if (err2) {
                        throw err2;
                    } else {
                        var taskRender = (!req.xhr) ? 'task.jade' : 'includes/task/task.jade';
                        res.render(taskRender, {
                            // These are navbar variables
                            loggedIn : req.isAuthenticated(),
                            isAjax : req.xhr,

                            // Project information.
                            projKey : foundProj.projectkey,
                            projName : foundProj.projectname,
                            projId : foundProj.projectid,
                            projList : req.user.local.projects,
                            firstname : req.user.local.firstname,
                            isProjectPage : false,

                            // Task information.
                            taskid : req.params.taskid,
                            taskname : foundTask.taskname,
                            taskdescription : foundTask.taskdescription,
                            statuses : app.locals.statuses,
                            usersList : usersList,
                            curAssignee : foundTask.assignedto,
                            curStatus : foundTask.status,
                            curPriority : foundTask.priority
                        });
                    }
                });
            }
        }); // end async waterfall
    }); // end app.get

    // Task edit AJAX GET request.
    app.get('/p/:projectid/t/:taskid/edit/', Helper.isLoggedIn, Helper.doesProjectExist,
            Helper.isUserProjectMember, Helper.isAjaxRequest, function(req, res) {
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
                    //console.log(taskList[i].taskid + ' ' + req.params.taskid)
                    if (taskList[i].taskid == req.params.taskid) {
                        var foundTask = taskList[i];
                        console.log('found task');
                        return callback(null, foundProj, foundTask);
                    }
                }
                console.log('1. couldn\'t find task');
                callback(1);
            },
            function getUsersList(foundProj, foundTask, callback) {
                Helper.getProjectMemberList(req.params.projectid, function(err,usersList) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, foundProj, foundTask, usersList);
                    }
                });
            }
        ],
        function(err, foundProj, foundTask, usersList) {
            if (err) {
                if (err == 1) {
                    console.log('2. couldn\'t find task');
                }
                res.send('error');
            } else {
                //foundTask.status = app.locals.statuses[req.params.status];
                foundProj.save(function(err2,done) {
                    if (err2) {
                        throw err2;
                    } else {
                        console.log('=====\n\n');
                        //Helper.getProjectMemberList(req.params.projectid);
                        console.log(foundTask.assignedto);
                        res.render('includes/task/edit.jade', {
                            // These are navbar variables
                            loggedIn : req.isAuthenticated(),
                            projList : req.user.local.projects,
                            firstname : req.user.local.firstname,
                            taskname : foundTask.taskname,
                            taskdescription : foundTask.taskdescription,
                            statuses : app.locals.statuses,
                            usersList : usersList,
                            curAssignee : foundTask.assignedto,
                            curStatus : foundTask.status,
                            curPriority : foundTask.priority
                        });
                    }
                });
            }
        }); // end async waterfall
    }); // end app.get

    // A task-edit AJAX POST request.
    app.post('/p/:projectid/t/:taskid/edit/', Helper.isLoggedIn, Helper.doesProjectExist, Helper.isUserProjectMember, function(req, res){
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
                    //console.log(taskList[i].taskid + ' ' + req.params.taskid)
                    if (taskList[i].taskid == req.params.taskid) {
                        var foundTask = taskList[i];
                        console.log('found task');
                        return callback(null, foundProj, taskList, i);
                    }
                }
                console.log('1. couldn\'t find task');
                callback(1);
            },
            function editTask(foundProj, taskList, index, callback) {
                console.log(req.body);
                taskList[index].taskname = req.body.taskname;
                taskList[index].taskdescription = req.body.taskdescription;
                taskList[index].status = req.body.status;
                taskList[index].assignedto = req.body.assignedto;
                taskList[index].priority = req.body.priority;

                // save this updated project
                foundProj.save(function(err2,done) {
                    if (err2) {
                        throw err2;
                    } else {
                        console.log('task modified and project updated');
                        //res.redirect('/p/' + req.params.projectid + '/');
                        callback(null, 'done');
                    }
                });
            }
        ], function(err, foundProj, taskList, index) {
            if (err) {
                if (err == 1) {
                    console.log('2. couldn\'t find task');
                }
                res.send('error');
            } else {
                res.redirect('/p/' + req.params.projectid + '/');
                //res.redirect('/');
            }
        }); // end async waterfall
    }); // end edit

    // A Task delete AJAX POST request.
    app.post('/p/:projectid/t/:taskid/delete/', Helper.isLoggedIn, Helper.doesProjectExist, Helper.isUserProjectMember, function(req, res) {
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
                    //console.log(taskList[i].taskid + ' ' + req.params.taskid)
                    if (taskList[i].taskid == req.params.taskid) {
                        var foundTask = taskList[i];
                        console.log('found task');
                        return callback(null, foundProj, taskList, i);
                    }
                }
                console.log('1. couldn\'t find task');
                callback(1);
            },
            function deleteTask(foundProj, taskList, index, callback) {
                taskList.splice(index,1);
                // save this updated project
                foundProj.save(function(err2,done) {
                    if (err2) {
                        throw err2;
                    } else {
                        console.log('task deleted and project updated');
                        //res.redirect('/p/' + req.params.projectid + '/');
                        callback(null, 'done');
                    }
                });
            }
        ], function(err, foundProj, taskList, index) {
            if (err) {
                if (err == 1) {
                    console.log('2. couldn\'t find task');
                }
                res.send('error');
            } else {
                res.redirect('/p/' + req.params.projectid + '/');
            }
        }); // end async waterfall
    }); // end delete task

    // A task-move AJAX request.
    app.post('/p/:projectid/movetask/', Helper.isLoggedIn, Helper.doesProjectExist,
            Helper.isUserProjectMember, Helper.isAjaxRequest, function(req, res) {
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
                    if (taskList[i].taskid == req.body.taskid) {
                        var foundTask = taskList[i];
                        return callback(null, foundProj, taskList, i);
                    }
                }
                callback(1);
            },
            function moveTask(foundProj, taskList, index, callback) {
                // Update the task's status and save it the project state.
                taskList[index].status = req.body.status;
                foundProj.save(function(err2, done) {
                    if (err2) {
                        throw err2;
                    } else {
                        callback(null, 'done');
                    }
                });
            }
        ], function(err, foundProj, taskList, index) {
            if (err) {
                res.send('error');
            } else {
                res.redirect('/p/' + req.params.projectid + '/');
            }
        }); // end async waterfall
    }); // end movetask

} // End of module exports
