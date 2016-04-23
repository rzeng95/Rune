var User = require('../models/user.js');
var Project = require('../models/project.js');

module.exports = function(app, passport) {

    app.get('/projects', isLoggedIn, function(req,res) {
        res.render('projects.jade', {
            user : req.user
        });

    });

    app.get('/createproject', isLoggedIn, function(req,res) {
        res.render('createproject.jade');

    });

    app.post('/createproject', isLoggedIn, function(req,res) {
        var projectName = req.body.projectname;
        var projectKey = req.body.projectkey;
        var userEmail = req.user.local.email;

        // Add this project's ID to the user's "projects" array
        // Add the user's ID to the project's "members" array
        var newProject = new Project();
        newProject.projectname = projectName;
        newProject.projectkey = projectKey;
        newProject.projectid = (newProject._id).toString();
        newProject.members.push(userEmail);
        newProject.save(function(err) {
            if (err)
                throw err;
            else {
                var projectUrl = newProject.projectid;
                console.log(newProject);
                res.redirect('/p/'+projectUrl);
            }

        });


        //res.json({'1': projectName, '2': projectKey, '3': userEmail});
    });

    app.get('/p/:projectid', isLoggedIn, isUserProjectMember, function(req,res) {
        var projectId = req.params.projectid;

        // Check to see if the project exists

        res.send(projectId);

    });

    app.post('/p/:projectid', isLoggedIn, function(req,res) {
        //handle creating new tasks
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

function isUserProjectMember(req,res,next) {
    //Find the current user and make sure they're part of the project being accessed
    Project.findOne({'members': req.user.local.email}, function(err,user) {
        if (err)
            return done(err);
        else if (!user) {
            req.flash('errorMessage', 'Not part of project');
            res.redirect('/error');
            }
        else
            return next();
    });
}
