var User = require('../models/user.js');
var Project = require('../models/project.js');

var Helper = require('../models/helpers.js');

var async = require('async');

module.exports = function(app, passport) {

    app.get('/godmode', Helper.isLoggedIn, function(req, res) {
    	if(req.user.local.email == "alexlw92@yahoo.com")
    	{
	    	User.find({}, function(err, users) {
	            if (err) {
	                throw err;
	            } else {                
	                Project.find({}, function(err, projects) {
			            if (err) {
			                throw err;
			            } else {
			                res.render('godmode.jade', {
					            // These are navbar variables
					            loggedIn : req.isAuthenticated(),
					            projList : req.user.local.projects,
					            firstname : req.user.local.firstname,
					            users : users,
					            projects : projects
	        				});
			                
			            }
			        });

	            }
	        });
	    }
	    else
	    	res.redirect('/');

    });

    app.post('/godmode/removeuser', Helper.isLoggedIn, function(req, res) {
    	User.findById(req.body.userid, function(err, user) {
            if (err) {
                throw err;
            } else {          
                for(var i=0; i<user.local.projects.length; i++) {

                	Project.findById(user.local.projects[i].projectid, function(err, project)
                	{
                		if(err) {
                			throw err
                		} else {
	                		project.members.splice(project.members.indexOf(user.local.email), 1);
	                		project.save(function(err) {
					            if (err) {
					                throw err;
					            } else {
					            }
					        });
	                	}
                	});
                }
                User.remove({ 'local.userid': req.body.userid} , function(err) {
                    if (err) {
                        throw err;
                    } else {
                         res.redirect('/godmode/');
                    }
                });
            }
        });

    });

    app.post('/godmode/removeproject', Helper.isLoggedIn, function(req, res) {
    	Project.findById(req.body.projectid, function(err, project) {
            if (err) {
                throw err;
            } else {          
                for(var i=0; i<project.members.length; i++) {
                	User.findOne({'local.email' : project.members[i]}, function(err, user)
                	{
                		if(err) {
                			throw err
                		} else {
                			for(var j=0; j<user.local.projects.length; j++) {
                				if(user.local.projects[j].projectid == project.projectid) {
                					user.local.projects.splice(j, 1);
                					break;
                				}
                			}
	                		user.save(function(err) {
					            if (err) {
					                throw err;
					            } else {console.log(user.local.projects)
					            }
					        });
	                	}
                	});
                }
                Project.remove({ 'projectid': req.body.projectid} , function(err) {
                    if (err) {
                        throw err;
                    } else {
                         res.redirect('/godmode/');
                    }
                });
            }
        });

    });

}