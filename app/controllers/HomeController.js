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

        // render the page and pass in any flash data if it exists
        res.render('login.jade', { message: req.flash('loginMessage') });
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP - This may or may not be its own page
    // =====================================
    app.get('/signup', function(req, res) {
        res.render('signup.jade', { message: req.flash('signupMessage') });
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    // =====================================
    // LOGOUT
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // =====================================
    // ERROR PAGE - This is displayed when someone who's not logged in attempts to access a protected page
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
        req.flash('errorMessage', 'You are not logged in and cannot see this page.');
        res.redirect('/error');
    }
}
