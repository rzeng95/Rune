/*
 * ErrorController returns the correct error message for accessing nonexistent endpoints and handles server error
*/

module.exports = function(app, passport) {

    // Handle 404
    app.use(function(req, res) {
        var loggedIn;
        var projList;
        var firstName;

        if (req.isAuthenticated()) {
            loggedIn = 1;
            projList = req.user.local.projects;
            firstName = req.user.local.firstname;
        }
        res.status(404).render('error.jade', {
            // These variables are required for the navbar
            loggedIn : loggedIn,
            projList : projList,
            firstname : firstName,

            errorMessage : '404: Not Found'
        });
    });

    // Handle 500
    app.use(function(error, req, res, next) {
        var loggedIn;
        var projList;
        var firstName;

        if (req.isAuthenticated()) {
            loggedIn = 1;
            projList = req.user.local.projects;
            firstName = req.user.local.firstname;
        }
        res.status(500).render('error.jade', {
            // These variables are required for the navbar
            loggedIn : loggedIn,
            projList : projList,
            firstname : firstName,

            errorMessage :'500: Internal Server Error'
        });
    });

};
