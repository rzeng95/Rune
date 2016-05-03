/*
 * ProfileController controls anything related to user profile
 * Right now it only renders profile, but most likely will control the student finder feature
*/

var User = require('../models/user.js');

var async = require('async');

module.exports = function(app, passport) {

    // =====================================
    // PROFILE
    // =====================================
    // The isLoggedIn function makes this page protected so that only logged in users can access it
    app.get('/profile', isLoggedIn, function(req, res) {
        //find logged in user and render that information.
        //var fullname = req.user.local.firstname + ' ' + req.user.local.lastname;
        //res.render('profile.jade', { name:fullname, isMe: 1 });
        res.redirect('/u/'+req.user._id);
    });

    app.get('/u/:userid', isLoggedIn, doesUserExist, function(req,res) {

        async.waterfall([
            function getUser(callback) {
                // Find the user details of the logged-in user by passing in the session-stored email as a search query
                User.findOne({'local.email': req.user.local.email}, function(err,usr){
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, usr);
                    }
                });
            },
            function checkIfMe(userBlob, callback) {
                // Check if the URL UserID parameter matches the logged in user's UserID.
                // If they match, then the logged in user is accessing his own profile.
                // When this happens, set var isMe = 1. This makes the user unable to add himself to a project

                var accessorID = (req.params.userid).toString(); // e.g. /u/5728007c04d268850e2c7ef3
                var loggedInID = (userBlob.local.userid).toString() // Pulled from the logged in user's info
                var isMe = (accessorID === loggedInID);

                callback(null, userBlob, isMe);
            }

        ], function(err,userBlob, isMe) {
            if (err) {
                throw err;
            } else {
                res.render('profile.jade', {
                    // These are navbar variables
                    loggedIn : req.isAuthenticated(),
                    projList : userBlob.local.projects,
                    firstname : userBlob.local.firstname,

                    // These are profile variables
                    fullname : userBlob.local.firstname + ' ' + userBlob.local.lastname,
                    isMe : isMe

                });
            }
        }); // End of async waterfall

    }) // End of app.get('/u/:userid')

}; // End of module exports

// Check if user is logged in, redirect to error page if they aren't
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    else {
        res.redirect('/login');
    }
}

function doesUserExist(req,res,next) {
    //Make sure that if the user url is manually entered, that it exists
    User.findOne({'local.userid': req.params.userid}, function(err,user){
        if (err)
            throw err;
        else if (!user) {
            req.flash('errorMessage', 'User does not exist');
            res.redirect('/error');
        } else
            return next();
    });

}
