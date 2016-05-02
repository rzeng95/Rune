/**
 *
 * HomeController controls all routes related to the homepage and general pages.
 * Currently it controls rendering homepage, login, signup, logout, and error
 *
 **/

module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        var firstname = '';
        var projectList = [];
        if (req.isAuthenticated()) {
            firstname = req.user.local.firstname;
            projectList = req.user.local.projects;
        }
        res.render('home.jade', {
            firstname : firstname,
            loggedIn : req.isAuthenticated(), //if not logged in, display the login form
            //message : req.flash('loginMessage'),   //handle errors with logging in
            signupMessage : req.flash('signupMessage'),
            projList : projectList
        });
    });

    app.post('/', passport.authenticate('local-signup', {
        successRedirect : '/profile',
        failureRedirect : '/',
        failureFlash : true
    }));

    // =====================================
    // LOGIN PAGE - This is a separate form
    // =====================================
    app.get('/login', function(req, res) {
        res.render('login.jade', {
            message : req.flash('loginMessage')

        });
    });

    // Successful logins direct the user to their profile page
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile',
        failureRedirect : '/login',
        failureFlash : true
    }));

/*
    // =====================================
    // SIGNUP - This may or may not be its own page
    // =====================================
    app.get('/signup', function(req, res) {
        res.render('signup.jade', { message: req.flash('signupMessage') });
        //res.render('home.jade', { signupMessage: req.flash('signupMessage') });
        //res.redirect('/')
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile',
        failureRedirect : '/signup',
        failureFlash : true
    }));
*/

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
        res.render('error.jade', { errorMessage: req.flash('errorMessage') } );
    });
};

// Check if user is logged in, redirect to error page if they aren't
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/login');
    }
}
