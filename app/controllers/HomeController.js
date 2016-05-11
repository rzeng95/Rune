/**
 *
 * HomeController controls all routes related to the homepage and general pages.
 * Currently it controls rendering homepage, login, signup, logout, and error
 *
 **/
var Helper = require('../models/helpers.js');

module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE - This endpoint handles both the logged-out and logged-in homepage.
    // =====================================
    app.get('/', function(req, res) {
        var firstname = '';
        var projectList = [];
        if (req.isAuthenticated()) {
            firstname = req.user.local.firstname;
            projectList = req.user.local.projects;
        }
        res.render('home.jade', {
            // These variables are required for the navbar
            firstname : firstname,
            loggedIn : req.isAuthenticated(),
            projList : projectList,

            // This message is displayed upon unsuccessful signups
            signupMessage : req.flash('signupMessage')
        });
    });

    app.post('/', passport.authenticate('local-signup', {
        successRedirect : '/profile',
        failureRedirect : '/',
        failureFlash : true
    }));

    // =====================================
    // LOGIN PAGE - The login page is only rendered if the user is not logged in.
    // =====================================
    app.get('/login', function(req, res) {
        if(req.isAuthenticated()) {
            res.redirect('/profile');
        } else {
            res.render('login.jade', {
                message : req.flash('loginMessage')

            });
        }
    });

    // Successful logins direct the user to their profile page
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile',
        failureRedirect : '/login',
        failureFlash : true
    }));


    // =====================================
    // SIGNUP - This is a copy of the signup form from the homepage.
    // =====================================
    app.get('/signup', function(req, res) {
        res.render('signup.jade', {
            message: req.flash('signupMessage')
        });
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile',
        failureRedirect : '/signup',
        failureFlash : true
    }));


    // =====================================
    // LOGOUT
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // =====================================
    // ERROR PAGE - This is displayed when someone accesses a forbidden page (not logged in, not member of project)
    // =====================================
    app.get('/error', function(req,res) {
        res.render('error.jade', {
            errorMessage : req.flash('errorMessage')
        });
    });

}; // End module exports
