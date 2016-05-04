/*
 * ProfileController controls anything related to user profile
 * Right now it only renders profile, but most likely will control the student finder feature
*/

var User = require('../models/user.js');

var Helper = require('../models/helpers.js');

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

    app.get('/u/:userid', Helper.isLoggedIn, Helper.doesUserExist, function(req, res) {

        User.findOne({'local.userid': req.params.userid}, function(err, usr){
            if (err) {
                throw err;
            } else {
                var accessorID = (req.params.userid).toString(); // e.g. /u/5728007c04d268850e2c7ef3
                var loggedInID = (req.user.local.userid).toString(); // Pulled from the logged in user's info
                console.log(accessorID);
                console.log(loggedInID);

                var isMe = (accessorID === loggedInID);
                console.log(isMe);

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

    }) // End of app.get('/u/:userid')

    //generates a page with all users, and a link to their profiles
    app.get('/users', Helper.isLoggedIn, function(req,res) {

        User.find({}, function(err,users) {
            if (err) {
                throw err;
            } else {
                var projectList = req.user.local.projects;
                res.render('users.jade', {
                    user : req.user,
                    userlist : users,
                    loggedIn : req.isAuthenticated(),
                    firstname: req.user.local.firstname
                });
            }
        });
    }); //End of app.get('/users')

}; // End of module exports
