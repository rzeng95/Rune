/*
 * HomeController controls all routes related to the homepage and general pages.
 * Currently it controls rendering homepage, login, signup, logout, and error
*/

module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.jade');
    });

    // =====================================
    // LOGIN PAGE - This may be incorporated into the homepage
    // =====================================
    app.get('/login', function(req, res) {
        res.render('login.jade', { message: req.flash('loginMessage') });
    });

    // Successful logins direct the user to their profile page
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile',
        failureRedirect : '/login',
        failureFlash : true
    }));

    // =====================================
    // SIGNUP - This may or may not be its own page
    // =====================================
    app.get('/signup', function(req, res) {
        res.render('signup.jade', { message: req.flash('signupMessage') });
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
        res.render('error.jade', { errorMessage: req.flash('errorMessage') } );

    });


};

// Check if user is logged in, redirect to error page if they aren't
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    else {
        res.redirect('/login');
    }
}
