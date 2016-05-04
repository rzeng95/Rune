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

    app.get('/u/:userid', Helper.isLoggedIn, Helper.doesUserExist, function(req,res) {

        User.findOne({'local.email': req.user.local.email}, function(err,usr){
            if (err) {
                throw err;
            } else {
                var accessorID = (req.params.userid).toString(); // e.g. /u/5728007c04d268850e2c7ef3
                var loggedInID = (usr.local.userid).toString() // Pulled from the logged in user's info
                var isMe = (accessorID === loggedInID);

                res.render('profile.jade', {
                    // These are navbar variables
                    loggedIn : req.isAuthenticated(),
                    projList : req.user.local.projects,
                    firstname : req.user.local.firstname,

                    // These are profile variables
                    fullname : req.user.local.firstname + ' ' + req.user.local.lastname,
                    isMe : isMe

                });
            }
        });

    }) // End of app.get('/u/:userid')

}; // End of module exports
