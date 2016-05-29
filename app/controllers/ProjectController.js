/**
 *
 * ProjectController handles individual project pages, project creation, and task management
 * This is the largest controller file, and can possibly be broken into ProjectController & TaskController
 *
 **/

var User = require('../models/user.js');
var Project = require('../models/project.js');

var Helper = require('../models/helpers.js');

var async = require('async');
var request = require('request');


module.exports = function(app, passport) {

    // Project creation will probably be done using a pop-up modal object, which can be done via front-end bootstrap magic.
    // Right now it's a separate page of its own located at /createproject
    app.get('/createproject', Helper.isLoggedIn, function(req, res) {
        res.render('createproject.jade', {
            // These are navbar variables
            loggedIn : req.isAuthenticated(),
            projList : req.user.local.projects,
            firstname : req.user.local.firstname,
        });
    });

    app.post('/createproject', Helper.isLoggedIn, function(req, res) {
        // Three things need to happen when a project is created:
        // 1. The project must contain the name and other relevant details passed to it from the web form
        // 2. The current logged-in user must automatically added to the project's member list
        // 3. The current logged-in user's database entry must be modified to add the project id to the user's "project" list
        var rawProjectName = req.body.projectname;
        var projectName = rawProjectName.trim();
        var projectKey = rawProjectName.replace(/\s+/g, '').substring(0,4).toUpperCase();
        var userEmail = req.user.local.email;

        // Add the user's email to the project's "members" array
        var newProject = new Project();
        newProject.projectname = projectName;
        newProject.projectkey = projectKey;
        newProject.projectid = (newProject._id).toString();
        newProject.admin = req.user.local.email;
        newProject.members.push(userEmail);
        newProject.counter = 0;
        newProject.github_repo = "";
        newProject.github_owner = "";
        newProject.github_url = "";
        newProject.ispublic = 0;
        newProject.save(function(err) {
            if (err) {
                throw err;
            } else {
                var projectUrl = newProject.projectid;
                console.log('project created ');
            }
        });

        // Add this project's ID to the user's "projects" array
        User.findOne({
            'local.email' : userEmail
        }, function(err, user) {
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
    app.get('/p/:projectid/', Helper.isLoggedIn, Helper.doesProjectExist, Helper.isUserProjectMember, function(req, res) {
        var statuses = app.locals.statuses;
        async.waterfall([
            function createTasks(callback) {
                var normalTasks = [];
                var archivedTasks = [];
                for(var j=0; j<statuses.length; j++) {
                    normalTasks[statuses[j]] =[];
                }
                callback(null, normalTasks, archivedTasks);
            },
            // find the Project specified by the accessed URL. We need this for the project's member list
            function getProjectByID(normalTasks, archivedTasks, callback) {
                Project.findById(req.params.projectid, function(err, foundProj){
                    if (err) {
                        callback(err);
                    } else {
                        //console.log(foundProj.tasks);
                        for (var i=0; i<foundProj.tasks.length; i++) {
                            if (foundProj.tasks[i].status == 'Archived') {
                                archivedTasks.push(foundProj.tasks[i]);
                            }
                            else {
                                for (var k=0; k<statuses.length; k++) {
                                    if (foundProj.tasks[i].status == statuses[k]) {
                                        normalTasks[statuses[k]].push(foundProj.tasks[i]);
                                        break;
                                    }
                                }
                            }


                        }
                        callback(null, foundProj, normalTasks, archivedTasks); // Pass the project members list to the next function
                    }
                });
            },
            function getProjectUserInfo(foundProj, normalTasks, archivedTasks, callback) {
                User.find({
                    'local.email' : {
                        $in : foundProj.members
                    }
                }, function(err, foundUsers) {
                    if (err) {
                        callback(err);
                    } else {
                        var memberList = [];
                        for (var i=0; i<foundUsers.length; i++) {
                            memberList.push({
                                'name':foundUsers[i].local.firstname+' '+foundUsers[i].local.lastname,
                                'initials':foundUsers[i].local.firstname.charAt(0) + foundUsers[i].local.lastname.charAt(0),
                                'email':foundUsers[i].local.email,
                                'id':foundUsers[i].local.userid,
                                'color':foundUsers[i].local.userColor
                            });
                        }
                        callback(null, foundProj, normalTasks, archivedTasks, memberList);
                    }
                });
            } ,
            function getUserApplys(foundProj, normalTasks, archivedTasks, memberList, callback) {
                User.find({
                    'local.userid' : {
                        $in : foundProj.pending
                    }
                }, function(err, usersList) {
                    if(err)
                        callback(err);
                    else {
                        var pendingUsers = [];
                        for (var i=0; i<usersList.length; i++) {
                            pendingUsers.push({
                                'name':usersList[i].local.firstname+' '+usersList[i].local.lastname,
                                'initials':usersList[i].local.firstname.charAt(0) + usersList[i].local.lastname.charAt(0),
                                'email':usersList[i].local.email,
                                'id':usersList[i].local.userid,
                                'color':usersList[i].local.userColor
                            });
                        }
                        callback(null, foundProj, normalTasks, archivedTasks, memberList, pendingUsers);
                    }
                });
                    
            },
            function getGitHubCommits(foundProj, normalTasks, archivedTasks, memberList, pendingUsers, callback) {
                var commitList;
                var options = {
                    //url : 'https://api.github.com/repos/' + foundProj.github_owner + '/' + foundProj.github_repo +
                    url : 'https://api.github.com/repos/' + foundProj.github_url + '/commits?client_id=fb79527a871e5ba8f0f7&client_secret=a82aa7f700c3f1022aefa81abdf77cf590593098',
                    headers : {
                        'User-Agent': 'request'
                    }
                };
                request(options, function(err,response,body){
                    if (response.statusCode !== 200) {
                        console.log('no associated github found; won\'t be displaying commit list');
                        callback(null, foundProj, normalTasks, archivedTasks, memberList, pendingUsers, null);
                    } else {
                        commitList = JSON.parse(body);
                        callback(null, foundProj, normalTasks, archivedTasks, memberList, pendingUsers, commitList);
                    }
                });
            }
        ], function(err, foundProj, normalTasks, archivedTasks, memberList, pendingUsers, commitList){
            if (err) {
                throw err;
            } else {
                console.log(foundProj.github_url)
                //console.log('Project Skills: ' + foundProj.projectskills);
                //console.log('Project Public?: ' + foundProj.ispublic);
                res.render('project.jade', {
                    // These are navbar variables
                    loggedIn : req.isAuthenticated(),
                    projList : req.user.local.projects,
                    firstname : req.user.local.firstname,
                    userColor : req.user.local.userColor,
                    email : req.user.local.email,
                    isProjectPage : true,

                    // Overview tab variables
                    project : foundProj,
                    projName : foundProj.projectname,
                    projKey : foundProj.projectkey,
                    projId : foundProj.projectid,
                    projAdmin : foundProj.admin,

                    github_repo : foundProj.github_repo,
                    github_owner : foundProj.github_owner,
                    full_url : foundProj.github_url,

                    //github commits
                    commits : commitList,

                    // User tab variables
                    projMembers : memberList,
                    pendingMembers : pendingUsers,

                    // Task tab variables
                    taskList : foundProj.tasks,

                    // Statuses
                    statuses: statuses,

                    // Kanban tab variables
                    tasks : normalTasks,
                    archivedtasks : archivedTasks,

                    // History variables
                    history : foundProj.history,

                    // Settings variables
                    github_url : foundProj.github_url,
                    description : foundProj.description,
                    projectskills: foundProj.projectskills,
                    ispublic: foundProj.ispublic
                });
            }
        });
    }); //end of app.post('/p/:projectid/')

    app.post('/p/:projectid/edit/', Helper.isLoggedIn, Helper.doesProjectExist, Helper.isUserProjectMember, function(req, res) {
        // update description and github repo
        Project.findById(req.params.projectid, function(err, foundProj){
            if (err) throw err;
            console.log(req.body);
            foundProj.github_url = req.body.github_url;
            foundProj.description = req.body.description;
            foundProj.ispublic = req.body.optradio;
            foundProj.projectskills = req.body.projectskills;

            foundProj.save(function(err){
                if (err) throw err;
                else {
                    res.redirect('/p/' + req.params.projectid + '/');
                }

            });

        });
    });

    // Only the project creator can delete projects.
    app.post('/p/:projectid/deleteproject/', Helper.isLoggedIn, Helper.doesProjectExist, Helper.isUserProjectMember, function(req, res) {

        async.waterfall([
            // First, find the project (we know it already exists because of Helper.doesProjectExist)
            function findProject(callback) {
                Project.findById(req.params.projectid, function(err, foundProj){
                    if (err) throw err;

                    else callback(null, foundProj);
                });
            } ,
            // Found the project; now compare admin with current logged in user
            function canDelete(foundProj, callback) {
                if (foundProj.admin === req.user.local.email) callback(null, foundProj.members);

                else callback(-1);
            } ,
            function removeProjectFromEachMember(memberList, callback) {
                console.log(memberList);
                async.each(memberList, function(member, done) {

                    User.findOne({'local.email' : member}, function(err, foundUser) {
                        if (err) {
                            throw err;
                        } else {
                            console.log('doing stuff to ' + member);
                            var projectList = foundUser.local.projects;
                            //var index = projectList.indexOf(req.params.projectid);
                            console.log(projectList.length);
                            for (var i = 0; i < projectList.length; i++) {
                                if (projectList[i].projectid === req.params.projectid) {
                                    console.log('found correct project, deleting now.');
                                    projectList.splice(i, 1);
                                    break;
                                }
                            }
                            foundUser.save(function(err, res) {
                                if (err) {
                                    throw err;
                                } else {
                                    console.log('===');
                                    done();
                                }
                            });

                        }
                    });

                } ,
                function(err) {
                    if (err) {
                        console.log('something happened when trying to remove this project from all members');
                        throw err;
                    } else {
                        console.log('removed this project from all members');
                        callback(null);
                    }

                });
            } ,
            // Now that we've removed this project from all users' member lists, we can delete the actual project.
            function deleteProject(callback) {
                Project.remove({ projectid : req.params.projectid} , function(err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            }

        ], function(err) {
            if (err) {
                if (err === -1 ) {
                    console.log('invalid permissions for deletion');
                    res.redirect('/p/' + req.params.projectid + '/');
                } else {
                    throw err;
                }
            } else {
                console.log('project successfully deleted and members updated');
                res.redirect('/profile');
            }
        });


    }); //end app.post

    
    app.post('/p/:projectid/applicationresponse/', Helper.isLoggedIn, Helper.doesProjectExist, Helper.isUserProjectMember, function(req, res) {
        Project.findById(req.params.projectid, function(err, foundProj){
            if (err) {
                callback(err);
            } else {
                if(req.body.ignore != null) {
                    // remove the value at index of the userid to be ignored
                    foundProj.pending.splice(foundProj.pending.indexOf(req.body.ignore), 1);
                    foundProj.save(function(err, response) {
                        if (err) {
                            res.redirect('/p/'+req.params.projectid)
                            throw err;
                        } else {
                            res.redirect('/p/'+req.params.projectid)
                        }
                    });
                }
                else if(req.body.accept != null) {
                    // remove the value at index of the userid to be accepted
                    foundProj.pending.splice(foundProj.pending.indexOf(req.body.accept), 1);
                    foundProj.save(function(err, response) {
                        if (err) {
                            res.redirect('/p/'+req.params.projectid)
                            throw err;
                        } else {
                            res.redirect('/u/'+req.body.accept+'/adduser/'+req.params.projectid);
                        }
                    });
                }
            }
        });
        


    }); //end app.post


}; // End of module.exports
