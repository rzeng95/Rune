var Helper = require('../models/helpers.js');

module.exports = function(app, passport) {
    app.get('/projectfinder', Helper.isLoggedIn, function(req, res) {
        res.render('projectfinder.jade', {
            // These are navbar variables
            loggedIn : req.isAuthenticated(),
            projList : req.user.local.projects,
            firstname : req.user.local.firstname
        });
    });

};
