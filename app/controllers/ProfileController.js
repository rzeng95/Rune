/*
 * ProfileController controls anything related to user profile
 * Right now it only renders profile, but most likely will control the student finder feature
*/

var User = require('../models/user.js');

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

        User.findOne({'local.userid' : req.params.userid}, function(err,usr) {
            if (err)
                throw err;
            else {
                //we're accessing the logged in user if the queried url userid = authenticated userid
                //and if isMe is true, then grey out the "add to project" button
                var isMe = ((usr.local.userid).toString() === (req.user.local.userid).toString());
                var fullname = usr.local.firstname + ' ' + usr.local.lastname;
                var projectList = usr.local.projects;
                res.render('profile.jade', {
                    loggedIn : req.isAuthenticated(),
                    name : fullname,
                    isMe : isMe,
                    firstname : usr.local.firstname,
                    projlist : projectList
                });
            }
        });
    })

};

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
