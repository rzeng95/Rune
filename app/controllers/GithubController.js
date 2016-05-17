var Helper = require('../models/helpers.js');

module.exports = function(app, passport) {

    app.get('/auth/github/', Helper.isLoggedIn, passport.authenticate('github'));

    app.get('/auth/github/callback/', Helper.isLoggedIn, passport.authenticate('github', {
        failureRedirect: '/github_fail',
        successRedirect: '/github_success',
        failureFlash : true
    }));

    app.get('/github_fail', function(req,res) {
        res.render('github.jade', {
            message1: 'fail',
            message2: req.flash('githubMessage')
        })
    })
    app.get('/github_success', function(req,res) {
        res.render('github.jade', {
            message1: 'success',
            message2: req.flash('githubMessage')
        })
    })
};
