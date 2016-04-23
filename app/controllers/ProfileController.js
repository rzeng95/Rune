module.exports = function(app, passport) {

    // =====================================
    // PROFILE
    // =====================================
    // The isLoggedIn function makes this page protected so that only logged in users can access it
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.jade', {
            user : req.user // get the user out of session and pass to template
        });
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
