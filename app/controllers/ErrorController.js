/*
 * ErrorController returns the correct error message for accessing nonexistent endpoints and handles server error
*/

module.exports = function(app, passport) {

    // Handle 404
    app.use(function(req, res) {
        res.status(404).render('error.jade', {
            // These variables are required for the navbar
            loggedIn : req.isAuthenticated(),
            projList : req.user.local.projects,
            firstname : req.user.local.firstname,

            errorMessage : '404: Not Found'
        });
    });

    // Handle 500
    app.use(function(error, req, res, next) {
        res.status(500).render('error.jade', {
            // These variables are required for the navbar
            loggedIn : req.isAuthenticated(),
            projList : req.user.local.projects,
            firstname : req.user.local.firstname,

            errorMessage :'500: Internal Server Error'
        });
    });

};
