module.exports = function(app,passport) {
    require('./controllers/HomeController.js')(app,passport);
    require('./controllers/ProfileController.js')(app,passport);
    require('./controllers/ProjectController.js')(app,passport);
    require('./controllers/TaskController.js')(app,passport);
    require('./controllers/GithubController.js')(app,passport);
    require('./controllers/ProjectFinderController.js')(app,passport);

    // This must be the very last, as it catches all routes not handled by the above controllers
    require('./controllers/ErrorController.js')(app,passport);

};
