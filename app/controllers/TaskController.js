/**
 *
 * The Task controller manages all forms of task management on Rune.
 *
 **/

var User = require('../models/user.js');
var Project = require('../models/project.js');
var Helper = require('../models/helpers.js');
var async = require('async');
var request = require('request');

// Declare the Task Controller Namespace.
var TaskController = {} || TaskController;

// Helper functions.

// Get the project object depending on a matching project ID in the URL.
TaskController.getProject = function(req, res, callback) {
    Project.findById(req.params.projectid, function(err, foundProj) {
        if (err) {
            callback(err);
        } else {
            callback(null, req, res, foundProj);
        }
    });
};

TaskController.setProject = function(err, req, res) {
    if (err) {
        res.send('Error: could not save project');
        return;
    } else {
        console.log('task modified and project updated');
        callback(null, req, res);
    }
};

// Get the matching task object given a project object and task id in the
// URL or URI.
TaskController.getTask = function(req, res, foundProj, callback) {
    var taskList = foundProj.tasks;
    for (var i = 0; i < taskList.length; i++) {
        if ((taskList[i].taskid === req.params.taskid) || (req.xhr && taskList[i].taskid === req.body.taskid)) {
            console.log('found task');
            return callback(null, req, res, foundProj, taskList[i]);
        }
    }
    console.log('1. couldn\'t find task');
    callback(1);
};

// Get a list of users given a project object and a task object.
TaskController.getUsersList = function(req, res, foundProj, foundTask, callback) {
    Helper.getProjectMemberList(req.params.projectid, function(err, usersList) {
        if (err) {
            callback(err);
        } else {
            callback(null, req, res, foundProj, foundTask, usersList);
        }
    });
};

// Redirection handler for POST endpoints to tasks.
TaskController.redirectToTask = function(err, req, res) {
    if (err) {
        res.send('error');
    } else {
        res.redirect('/p/' + req.params.projectid + '/t/' + req.params.taskid);
    }
};

// The actual definition of the task controller module.
module.exports = function(app, passport) {
    // Task creation is handled through a front-end pop-up modal.
    app.get('/p/:projectid/createtask/', Helper.isLoggedIn, Helper.doesProjectExist, Helper.isUserProjectMember,
            Helper.isAjaxRequest, function(req, res) {
        Helper.getProjectMemberList(req.params.projectid, function(err, userList) {
            if (err) {
                res.send('error');
                return;
            }
            res.render('includes/task/create.jade', {
                loggedIn: req.isAuthenticated(),
                projList: req.user.local.projects,
                firstname: req.user.local.firstname,
                usersList: userList,
                statuses: app.locals.statuses
            });
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
                res.send;
            }
            foundProj.counter++;
            var taskID = foundProj.projectkey + '-' + Helper.zeroPad(foundProj.counter, 3);
            var taskAssigned = (req.body.assignedto == '') ? 'no one yet': req.body.assignedto;
            foundProj.tasks.push({
                projectid       :   req.params.projectid,
                taskname        :   req.body.taskname,
                taskid          :   taskID,
                taskdescription :   req.body.taskdescription,
                createdby       :   req.user.local.firstname + ' ' + req.user.local.lastname,
                assignedto      :   req.body.assignedto,
                status          :   req.body.status,
                datecreated     :   new Date().toDateString(),
                priority        :   req.body.priority,
                issuetype       :   req.body.issuetype
            });
            foundProj.history.push({
                date: new Date().toDateString(),
                link: taskID,
                action: req.user.local.firstname + ' ' + req.user.local.lastname + ' created new task',
                description: 'and assigned to ' + taskAssigned
            });
            foundProj.save(function(err) {
                res.redirect('/p/' + req.params.projectid + '/');
            });
        });
    });

    // A Task page GET request.
    app.get('/p/:projectid/t/:taskid/', Helper.isLoggedIn, Helper.doesProjectExist, Helper.isUserProjectMember, function(req, res) {
        async.waterfall([
            async.apply(TaskController.getProject, req, res),
            TaskController.getTask,
            function getGitHubCommits(req, res, foundProj, foundTask, callback) {
                var commitList;
                var options = {
                    url: 'https://api.github.com/repos/' + foundProj.github_url + '/commits?client_id=fb79527a871e5ba8f0f7&client_secret=a82aa7f700c3f1022aefa81abdf77cf590593098',
                    headers: {
                        'User-Agent': 'request'
                    }
                };
                request(options, function(err, response, body) {
                    if (response.statusCode !== 200) {
                        callback(null, foundProj, foundTask, null);
                    } else {
                        commitList = JSON.parse(body);
                        callback(null, foundProj, foundTask, commitList);
                    }
                });
            }
        ],
        function(err, foundProj, foundTask, commitList) {
            if (err) {
                res.send('error');
                return;
            }
            foundProj.save(function(err2, done) {
                if (err2) {
                    res.send('Error: could not save project');
                    return;
                }
                var taskRender = (!req.xhr) ? 'task.jade': 'includes/task/task.jade';
                res.render(taskRender, {
                    // These are navbar variables
                    loggedIn: req.isAuthenticated(),
                    isAjax: req.xhr,

                    // Project information.
                    project: foundProj,
                    projKey: foundProj.projectkey,
                    projName: foundProj.projectname,
                    projId: foundProj.projectid,
                    projList: req.user.local.projects,
                    firstname: req.user.local.firstname,
                    github_repo: foundProj.github_repo,
                    github_owner: foundProj.github_owner,
                    github_url: foundProj.github_url,
                    commits: commitList,

                    // Task information.
                    task: foundTask,
                    statuses: app.locals.statuses,
                    createdby: req.user.local.firstname + ' ' + req.user.local.lastname,
                    completed: (foundTask.status === 'Completed') ? true: false,
                    archived: (foundTask.status === 'Archived') ? true: false,
                });
            });
        }); // End async waterfall.
    }); // End app.get.

    // Task edit AJAX GET request.
    app.get('/p/:projectid/t/:taskid/edit/', Helper.isLoggedIn, Helper.doesProjectExist,
            Helper.isUserProjectMember, Helper.isAjaxRequest, function(req, res) {
        async.waterfall([
            async.apply(TaskController.getProject, req, res),
            TaskController.getTask,
            TaskController.getUsersList
        ],
        function(err, foundProj, foundTask, usersList) {
            if (err) {
                res.send('error');
                return;
            }
            foundProj.save(function(err2, done) {
                if (err2) {
                    res.send('Error: could not save project');
                    return;
                }
                res.render('includes/task/edit.jade', {
                    loggedIn: req.isAuthenticated(),

                    // Task information.
                    projList: req.user.local.projects,
                    firstname: req.user.local.firstname,
                    taskname: foundTask.taskname,
                    taskdescription: foundTask.taskdescription,
                    statuses: app.locals.statuses,
                    usersList: usersList,
                    curAssignee: foundTask.assignedto,
                    curStatus: foundTask.status,
                    curPriority: foundTask.priority
                });
            });
        }); // End async waterfall.
    }); // End app.get.

    // A task-edit AJAX POST request.
    app.post('/p/:projectid/t/:taskid/edit/', Helper.isLoggedIn, Helper.doesProjectExist, Helper.isUserProjectMember, function(req, res){
        async.waterfall([
            async.apply(TaskController.getProject, req, res),
            TaskController.getTask,
            function editTask(req, res, foundProj, foundTask, callback) {
                if (foundTask.status !== req.body.status) {
                    foundProj.history.push({
                        date: new Date().toDateString(),
                        link: foundTask.taskid,
                        action: req.user.local.firstname + ' ' + req.user.local.lastname + ' moved',
                        description: 'from [ ' + foundTask.status + ' ] to [ ' + req.body.status + ' ]'
                    });
                }
                foundTask.taskname = req.body.taskname;
                foundTask.taskdescription = req.body.taskdescription;
                foundTask.status = req.body.status;
                foundTask.assignedto = req.body.assignedto;
                foundTask.priority = req.body.priority;

                // Save this updated project.
                foundProj.save(function(err2, done) {
                    if (err2) {
                        res.send('Error: could not save project');
                        return;
                    } else {
                        console.log('task modified and project updated');
                        callback(null, req, res);
                    }
                });
            }
        ], TaskController.redirectToTask); // End async waterfall.
    }); // End edit.

    // A Task archive AJAX POST request.
    app.post('/p/:projectid/t/:taskid/archive/', Helper.isLoggedIn, Helper.doesProjectExist, Helper.isUserProjectMember, function(req, res) {
        async.waterfall([
            async.apply(TaskController.getProject, req, res),
            TaskController.getTask,
            function archiveTask(req, res, foundProj, foundTask, callback) {
                foundTask.status = 'Archived';
                foundProj.history.push({
                    date: new Date().toDateString(),
                    link: foundTask.taskid,
                    action: req.user.local.firstname + ' ' + req.user.local.lastname + ' archived'
                });
                // save this updated project
                foundProj.save(function(err2,done) {
                    if (err2) {
                        res.send('Error: could not save project');
                        return;
                    } else {
                        console.log('task archived');
                        callback(null, req, res);
                    }
                });
            }
        ], TaskController.redirectToTask); // End async waterfall.
    }); // end delete task

    // A Task unarchive AJAX POST request.
    app.post('/p/:projectid/t/:taskid/unarchive/', Helper.isLoggedIn, Helper.doesProjectExist, Helper.isUserProjectMember, function(req, res) {
        async.waterfall([
            async.apply(TaskController.getProject, req, res),
            TaskController.getTask,
            function unarchiveTask(req, res, foundProj, foundTask, callback) {
                foundTask.status = 'Completed';
                foundProj.history.push({
                    date: new Date().toDateString(),
                    link: foundTask.taskid,
                    action: req.user.local.firstname + ' ' + req.user.local.lastname + ' unarchived'
                });
                // save this updated project
                foundProj.save(function(err2,done) {
                    if (err2) {
                        res.send('Error: could not save project');
                        return;
                    } else {
                        console.log('task unarchived');
                        callback(null, req, res);
                    }
                });
            }
        ], TaskController.redirectToTask); // End async waterfall.
    }); // end delete task

    // A Task delete AJAX POST request.
    app.post('/p/:projectid/t/:taskid/delete/', Helper.isLoggedIn, Helper.doesProjectExist, Helper.isUserProjectMember, function(req, res) {
        async.waterfall([
            async.apply(TaskController.getProject, req, res),
            function deleteTask(req, res, foundProj, callback) {
                // Find the task with the given task ID and delete it.
                var taskList = foundProj.tasks;
                for (var i = 0; i < taskList.length; i++) {
                    if (taskList[i].taskid === req.params.taskid) {
                        foundProj.history.push({
                            date: new Date().toDateString(),
                            action: req.user.local.firstname + ' ' + req.user.local.lastname + ' deleted ' + taskList[i].taskid + ': ' +  taskList[i].taskdescription,
                        });
                        foundProj.tasks.splice(i, 1);
                        break;
                    }
                }

                // Save this updated project.
                foundProj.save(function(err2, done) {
                    if (err2) {
                        res.send('Error: could not save project');
                        return;
                    } else {
                        console.log('task deleted and project updated');
                        callback(null, req, res);
                    }
                });
            }
        ], function(err, req, res) {
            if (err) {
                res.send('error');
            } else {
                res.redirect('/p/' + req.params.projectid);
            }
        }); // End async waterfall.
    }); // end delete task

    // A task-move AJAX request.
    app.post('/p/:projectid/movetask/', Helper.isLoggedIn, Helper.doesProjectExist,
            Helper.isUserProjectMember, Helper.isAjaxRequest, function(req, res) {
        async.waterfall([
            async.apply(TaskController.getProject, req, res),
            TaskController.getTask,
            function moveTask(req, res, foundProj, foundTask, callback) {
                // Update the task's status and save it the project state.
                if (foundTask.status !== req.body.status) {
                    foundProj.history.push({
                        date: new Date().toDateString(),
                        link: foundTask.taskid,
                        action: req.user.local.firstname + ' ' + req.user.local.lastname + ' moved',
                        description: 'from [ ' + foundTask.status + ' ] to [ ' + req.body.status + ' ]'
                    });
                }
                foundTask.status = req.body.status;
                foundProj.save(function(err2, done) {
                    if (err2) {
                        res.send('Error: could not save project');
                        return;
                    } else {
                        callback(null, req, res);
                    }
                });
            }
        ], TaskController.redirectToTask); // End async waterfall.
    }); // end movetask

    // A task-comment POST request.
    app.post('/p/:projectid/t/:taskid/comment/', Helper.isLoggedIn, Helper.doesProjectExist, Helper.isUserProjectMember, function(req, res) {
        async.waterfall([
            async.apply(TaskController.getProject, req, res),
            TaskController.getTask,
            function addComment(req, res, foundProj, foundTask, callback) {
                foundTask.comments.push({
                    date: new Date().toDateString(),
                    authorid: req.user.local.userid,
                    authorname: req.user.local.firstname + ' ' + req.user.local.lastname,
                    comment: req.body.comment,
                    github: req.body.githubcommit
                });

                // save this updated project
                foundProj.save(function(err2, done) {
                    if (err2) {
                        res.send('Error: could not save project');
                        return;
                    } else {
                        console.log('task modified and project updated');
                        callback(null, req, res);
                    }
                });
            }
        ], TaskController.redirectToTask); // End async waterfall.
    }); // End edit.

}; // End of module exports
