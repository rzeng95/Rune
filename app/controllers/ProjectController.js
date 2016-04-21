module.exports = function(app, passport) {

    app.get('/projects', isLoggedIn, function(req,res) {
        res.render('projects.jade', {
            user : req.user
        });

    });

    app.get('/createproject', isLoggedIn, function(req,res) {
        res.send('todo: make this page');

    });

};

// Check if user is logged in, redirect to error page if they aren't
function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
        return next();

    else
        res.redirect('/error');
}
