/*
 * ProfileController controls anything related to user profile
*/

var User = require('../models/user.js');
var Project = require('../models/project.js');
var Helper = require('../models/helpers.js');

var async = require('async');
var request = require('request');

module.exports = function(app, passport) {

    // =====================================
    // PROFILE - User profile pages display basic information on the user, depending on who's accessing the page.
    // =====================================

    // The /profile endpoint is hit upon successful login, and takes the user to their own profile page
    app.get('/profile', Helper.isLoggedIn, function(req, res) {
        res.redirect('/u/' + req.user._id);
    });

    // To get a user's list of projects, first look up their ID to find their email,
    // and then query the projects database to get all projects that the user is a member of.
    app.get('/u/:userid/', Helper.isLoggedIn, Helper.doesUserExist, function(req, res) {

        User.findOne({'local.userid': req.params.userid}, function(err, usr){
            if (err) {
                throw err;
            } else {
                Project.find({'members': usr.local.email}, function(err, projects)
                {
                    // If the URL matches the logged-in user's ID, then it means the user is attempting to access their own page.
                    var accessorID = (req.params.userid).toString(); // e.g. /u/5728007c04d268850e2c7ef3
                    var loggedInID = (req.user.local.userid).toString(); // Pulled from the logged in user's info
                    var isMe = (accessorID === loggedInID);

                    var description;
                    if (!usr.local.description) {
                        description = 'I haven\'t posted my description!';
                    } else {
                        description = usr.local.description;
                    }
                    var github;
                    if (!usr.local.githubUrl) {
                        github = '#';
                    } else {
                        github = usr.local.githubUrl;
                    }
                    console.log('github username: ' + usr.local.github);
                    console.log('github url: ' + usr.local.githubUrl);
                    if(usr.local.githubUrl && usr.local.github) {
                        var options = {
                            url : 'https://api.github.com/users/' + usr.local.github +/*+ req.body.repo_owner + '/' + req.body.repo_name +*/ '/repos?type=all&sort=updated&client_id=fb79527a871e5ba8f0f7&client_secret=a82aa7f700c3f1022aefa81abdf77cf590593098',
                            headers : {
                                'User-Agent': 'request'
                            }
                        };
                        request(options, function(err,response,body){
                            if (response.statusCode !== 200) {
                                console.log('something weird happened.');
                                res.render('error.jade', {errorMessage: 'Error connecting with Github'});

                            } else {
                                var githubProjectList = JSON.parse(body);

                                res.render('profile.jade', {
                                    // These are navbar variables
                                    loggedIn : req.isAuthenticated(),
                                    projList : req.user.local.projects,
                                    firstname : req.user.local.firstname,

                                    // These are profile variables
                                    fullname : usr.local.firstname + ' ' + usr.local.lastname,
                                    initials : usr.local.firstname.charAt(0) + usr.local.lastname.charAt(0),
                                    email : usr.local.email,
                                    isMe : isMe,
                                    userColor : usr.local.userColor,
                                    userProjects : usr.local.projects,
                                    myProjects : projects,
                                    description : description,
                                    github : usr.local.githubUrl,

                                    githubProjectList : githubProjectList
                                });
                            }

                        }); // end request


                    } else {
                        res.render('profile.jade', {
                            // These are navbar variables
                            loggedIn : req.isAuthenticated(),
                            projList : req.user.local.projects,
                            firstname : req.user.local.firstname,

                            // These are profile variables
                            fullname : usr.local.firstname + ' ' + usr.local.lastname,
                            initials : usr.local.firstname.charAt(0) + usr.local.lastname.charAt(0),
                            email : usr.local.email,
                            isMe : isMe,
                            userColor : usr.local.userColor,
                            userProjects : usr.local.projects,
                            myProjects : projects,
                            description : description,
                            github : github

                        });
                    }


                }); //end project.find

            } //end else
        }); // end User.findOne

    }); // End of app.get('/u/:userid')

    app.get('/u/:userid/adduser/:projectid', Helper.isLoggedIn, Helper.doesUserExist, Helper.doesProjectExist, function(req,res) {
        // Five things need to happen:
        // First, find the user given by req.params.userid
        // Then, find the project given by req.params.projectid
        // Make sure the user isn't already a member of the project
        // Add the user to that project. Save
        // Add the project to the user's list of projects. Save
        async.waterfall([
            function findUser(callback) {
                User.findOne({'local.userid' : req.params.userid}, function(err,foundUser) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, foundUser); // the found user gets passed into foundUser variable
                    }
                });
            },
            function findProject(foundUser, callback) {
                Project.findOne({'projectid': req.params.projectid}, function(err,foundProject) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, foundUser, foundProject); // now both the found user and the found project can be modified in the next function
                    }
                });

            },
            function checkIfUserIsAlreadyMember(foundUser, foundProject, callback) {
                var membersList = foundProject.members;
                if (membersList.indexOf(foundUser.local.email) === -1) {
                    callback(null, foundUser, foundProject);
                } else {
                    callback(1);
                }

            },
            function addUserToProject(foundUser, foundProject, callback) {
                var userEmail = foundUser.local.email;
                foundProject.members.push(userEmail);
                foundProject.save(function(err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, foundUser, foundProject);
                    }
                });

            },
            function addProjectToUser(foundUser, foundProject, callback) {
                foundUser.local.projects.push({
                    projectkey : foundProject.projectkey,
                    projectid : (foundProject.projectid).toString()
                });
                foundUser.save(function(err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }

                });
            }
        ], function(err){
            if (err) {
                if (err === 1) {
                    console.log('user already a member of project');
                    //ToDo: error popup modal
                    res.redirect('/p/' + req.params.projectid + '/');
                } else {
                    throw err;
                }
            } else {
                res.redirect('/p/' + req.params.projectid + '/');
            }
        });
    });


    app.get('/u/:userid/edit', Helper.isLoggedIn, Helper.doesUserExist, Helper.canUserEditProfile, function(req,res) {

        User.findOne({'local.userid': req.params.userid}, function(err, usr){
            if (err) {
                throw err;
            } else {
                Project.find({'members': usr.local.email}, function(err, projects)
                {

                    res.render('editprofile.jade', {
                        // These are navbar variables
                        loggedIn : req.isAuthenticated(),
                        projList : req.user.local.projects,
                        firstname : req.user.local.firstname,

                        // These are profile variables
                        fullname : usr.local.firstname + ' ' + usr.local.lastname,
                        initials : usr.local.firstname.charAt(0) + usr.local.lastname.charAt(0),
                        email : usr.local.email,
                        isMe : 1,
                        userColor : usr.local.userColor,
                        userProjects : usr.local.projects,
                        myProjects : projects,
                        description : req.user.local.description,
                        githubUrl : req.user.local.githubUrl

                    });
                }); //end project.find

            } //end else
        }); // end User.findOne
    });

    app.post('/u/:userid/edit', Helper.isLoggedIn, Helper.doesUserExist, Helper.canUserEditProfile, function(req,res) {
        User.findOne({'local.userid': req.params.userid}, function(err, usr){
            if (err) {
                throw err;
            } else {
                console.log(req.body.description);
                console.log(req.body.github);
                usr.local.description = req.body.description;
                usr.local.github = req.body.github;

                usr.save(function(err) {
                    if (err) throw err;
                    console.log('info saved and user updated');
                    res.redirect('/u/' + req.params.userid + '/');

                });
            }
        });

    });

    //generates a page with all users, and a link to their profiles
    app.get('/users', Helper.isLoggedIn, function(req,res) {
        User.find({}, function(err,users) {
            if (err) {
                throw err;
            } else {
                var projectList = req.user.local.projects;
                res.render('users.jade', {
                    // These are navbar variables
                    loggedIn : req.isAuthenticated(),
                    projList : req.user.local.projects,
                    firstname : req.user.local.firstname,
                    color: req.user.local.userColor,
                    user : req.user,
                    userlist : users
                });
            }
        });
    }); //End of app.get('/users')

    app.post('/u/:userid/delete', Helper.isLoggedIn, Helper.doesUserExist, function(req, res) {
        async.waterfall([
            function getUser(callback) {
                User.findOne({'local.userid': req.params.userid}, function(err, foundUser) {
                    if (err) callback(err);
                    else callback(null, foundUser);
                });
            } ,
            function checkPermissions(foundUser, callback) {
                var accessorID = (req.params.userid).toString();
                var loggedInID = (req.user.local.userid).toString();
                if (accessorID === loggedInID) {
                    console.log('Confirmed that logged in user is attempting to delete their own account');
                    callback(null, foundUser.local.projects);
                } else {
                    callback(-1);
                }
            } ,
            function removeUserFromProjects(projectList, callback) {
                //console.log(projectList);
                async.each(projectList, function(proj, done) {
                    console.log('doing stuff to individual project');

                    var projID = proj['projectid'];
                        // look for the project with that ID, and remove req.user.local.email from that project's "members" array

                    Project.findById(projID, function(err, foundProj) {
                        if (err) callback(-2);
                        else {
                                var memberList = foundProj.members;
                                for (var i = 0; i < memberList.length; i++) {
                                    if (memberList[i] === req.user.local.email) {
                                        console.log('found user inside project members list, removing now');
                                        memberList.splice(i, 1);
                                    }
                                }
                                foundProj.save(function(err) {
                                    if (err) callback(err);
                                    done();
                                });
                            }
                    });



                } ,
                function(err) {

                    console.log('done operating on all projects in the user project list');
                    callback(null);
                });

            } ,
            function deleteUser(callback) {

                User.remove({ 'local.userid' : req.params.userid} , function(err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });

                callback(null);
            }

        ], function(err) {
            if (err) {
                if (err === -1) {
                    console.log('Can\'t delete someone that\'s not yourself. Redirecting');
                    res.redirect('/u/' + req.params.userid + '/');
                } else if (err === -2){
                    console.log('Shouldn\'t come to this. Means we tried to access a project that didn\'t exist');
                    throw err;
                } else {
                    throw err;
                }
            } else {
                console.log('Waterfall done. User is deleted, redirecting to logout');
                res.redirect('/logout');
            }
        });

    });

}; // End of module exports
