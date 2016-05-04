/*
 * ProfileController controls anything related to user profile
 * Right now it only renders profile, but most likely will control the student finder feature
*/

var User = require('../models/user.js');
var Project = require('../models/project.js');

var Helper = require('../models/helpers.js');

var async = require('async');

module.exports = function(app, passport) {

    // =====================================
    // PROFILE
    // =====================================
    // The isLoggedIn function makes this page protected so that only logged in users can access it
    app.get('/profile', Helper.isLoggedIn, function(req, res) {
        //find logged in user and render that information.
        //var fullname = req.user.local.firstname + ' ' + req.user.local.lastname;
        //res.render('profile.jade', { name:fullname, isMe: 1 });
        res.redirect('/u/'+req.user._id);
    });

    app.get('/u/:userid/', Helper.isLoggedIn, Helper.doesUserExist, function(req, res) {

        User.findOne({'local.userid': req.params.userid}, function(err, usr){
            if (err) {
                throw err;
            } else {
                var accessorID = (req.params.userid).toString(); // e.g. /u/5728007c04d268850e2c7ef3
                var loggedInID = (req.user.local.userid).toString(); // Pulled from the logged in user's info

                var isMe = (accessorID === loggedInID);

                res.render('profile.jade', {
                    // These are navbar variables
                    loggedIn : req.isAuthenticated(),
                    projList : req.user.local.projects,
                    firstname : req.user.local.firstname,

                    // These are profile variables
                    fullname : usr.local.firstname + ' ' + usr.local.lastname,
                    isMe : isMe

                });
            }
        });

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
                })

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
                if (err == 1) {
                    console.log("user already a member of project");
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


                    user : req.user,
                    userlist : users
                });
            }
        });
    }); //End of app.get('/users')

} // End of module exports
