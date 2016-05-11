/*
 * ErrorController returns the correct error message for accessing nonexistent endpoints and handles server error
*/

module.exports = function(app, passport) {

    // Handle 404
    app.use(function(req, res) {
        res.status(404).render('error.jade', {errorMessage : '404: Not Found'});
    });

    // Handle 500
    app.use(function(error, req, res, next) {
        res.status(500).render('error.jade', {errorMessage :'500: Internal Server Error'});
    });
    
};
