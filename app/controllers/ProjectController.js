var User = require('../models/user.js');
var Project = require('../models/project.js');

module.exports = function(app, passport) {

    app.get('/projects', isLoggedIn, function(req,res) {

        User.findOne({'local.email': req.user.local.email}, function(err,user) {
            if (err)
                throw err;
            else {

                var projectList = user.local.projects;
                /*
                var i = 0;

                while (projectList[i] !== undefined) {

                    i++;
                }
                */
                console.log(projectList);
                res.render('projects.jade', {user : req.user, projlist : projectList});
            }
        });
    });

    app.get('/createproject', isLoggedIn, function(req,res) {
        res.render('createproject.jade');

    });

    app.post('/createproject', isLoggedIn, function(req,res) {
        var projectName = req.body.projectname;
        var projectKey = req.body.projectkey;
        var userEmail = req.user.local.email;

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
                console.log('project created ');
            }
        });

        // Add this project's ID to the user's "projects" array
        User.findOne({'local.email': userEmail}, function(err,user) {
            if (err)
                return done(err);
            else if (!user) {
                req.flash('errorMessage', 'Something pretty bad happened...');
                res.redirect('/error');
            } else {

                user.local.projects.push( (newProject.projectid).toString() );

                user.save(function(err) {
                    console.log('project added to user');
                    res.redirect('/p/'+newProject.projectid);
                });

            }
        });

    });

    app.get('/p/:projectid', isLoggedIn, doesProjectExist, isUserProjectMember, function(req,res) {
        var projectId = req.params.projectid;

        Project.findById(projectId, function(err, proj) {
            if (err)
                throw err;
            else {
                res.render('individualproject.jade', {
                    projName : proj.projectname,
                    projId : proj.projectid,
                    projMembers : proj.members
                });
            }
        });

    });

    app.post('/p/:projectid', isLoggedIn, doesProjectExist, isUserProjectMember, function(req,res) {
        //handle creating new tasks
    });

};

// Check if user is logged in, redirect to error page if they aren't
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    else {
        //req.flash('errorMessage', 'You are not logged in and cannot see this page.');
        //res.redirect('/error');
        res.redirect('/login');
    }
}

function isUserProjectMember(req,res,next) {
    //Find the current user and make sure they're part of the project being accessed
    Project.findOne({'members': req.user.local.email}, function(err,user) {
        if (err)
            return done(err);
        else if (!user) {
            req.flash('errorMessage', 'Not a member of project');
            res.redirect('/error');
        } else
            return next();
    });
}

function doesProjectExist(req,res,next) {
    //Make sure if the project url is manually entered, that it exists
    Project.findOne({'projectid': req.params.projectid}, function(err,proj){
        if (err)
            return done(err);
        else if (!proj) {
            req.flash('errorMessage', 'Project does not exist');
            res.redirect('/error');
        } else
            return next();
    });

}
