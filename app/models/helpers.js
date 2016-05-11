var User = require('./user.js');
var Project = require('./project.js');
//var Task = require('./task.js');

var async = require('async');

module.exports = {

    // Check if user is logged in, redirect to error page if they aren't
    isLoggedIn : function(req, res, next) {
        if (req.isAuthenticated())
            return next();
        else {
            res.redirect('/login');
        }
    } ,

    //Make sure that if the user url is manually entered, that it exists
    doesUserExist : function(req,res,next) {
        User.findOne({'local.userid': req.params.userid}, function(err,user){
            if (err)
                throw err;
            else if (!user) {
                req.flash('errorMessage', 'User does not exist');
                res.redirect('/error');
            } else
                return next();
        });
    } ,

    //Find the current user and make sure they're part of the project being accessed
    isUserProjectMember : function(req,res,next) {

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
    } ,

    //Make sure that if the project url is manually entered, that it exists
    doesProjectExist : function(req,res,next) {
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
    } ,

    // Check if HTTP request made is from AJAX or not.
    isAjaxRequest : function(req, res, next) {
        if (req.xhr)
            return next();
        else {
            res.redirect('/error');
        }
    },

    // This is used to pad the task number with 0s. For example, it creates JIRA-001
    zeroPad : function(num, places) {
        var zero = places - num.toString().length + 1;
        return Array(+(zero > 0 && zero)).join("0") + num;
    } ,


    getProjectMemberList : function(projectid, done) {
        async.waterfall([

            // Look for the project to make sure it exists
            function getProjectById(callback) {
                Project.findById(projectid, function(err, foundProj) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, foundProj);
                    }
                });
            } ,

            function findUsers(foundProj, callback) {
                User.find( {'local.email' : {$in : foundProj.members} }, function(err, users) {
                    if (err) {
                        callback(err);
                    } else {
                        var usersList = [];
                        for (var i = 0; i < users.length; i++) {
                            usersList.push({
                                "name" : users[i].local.firstname + " " + users[i].local.lastname,
                                "email" : users[i].local.email,
                                "color" : users[i].local.userColor
                            });
                        }
                        callback(null, usersList);
                    }
                });
            }

        ], function(err,usersList){
            if (err) {
                done(err);
            } else {
                //console.log(userList);
                done(null, usersList);
            }

        });
    }
/*
    // Navbar variables:
    // * First Name (replaces "Log In" button if user is logged in)
    // * Project List (Project dropdown, different for each user)
    renderNavbar : function(req, callback) {

        // Note that the email being searched is ALWAYS that of the logged in user, since the Projects dropdown should only display projects of the logged-in user.
        User.findOne({'local.email': req.user.local.email}, function(err,usr){
            if (err) {
                callback(err);
            } else {
                var firstName = usr.local.firstname;
                var projList = usr.local.projects;
                callback(null, firstname, projList);
            }
        })

    }
*/




}; // End of module.exports
