module.exports = function(app,passport) {
    require('./controllers/HomeController.js')(app,passport);
    require('./controllers/ProfileController.js')(app,passport);
    require('./controllers/ProjectController.js')(app,passport);
    require('./controllers/TaskController.js')(app,passport);
};
