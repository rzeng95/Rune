var Helper = require('../models/helpers.js');
var Project = require('../models/project.js');

module.exports = function(app, passport) {
    app.get('/projectfinder', Helper.isLoggedIn, function(req, res) {
    	Project.find({}, function(err,projs) {
            if (err) {
                throw err;
            } else {
            	console.log(projs);
            	res.render('projectfinder.jade', {
		            // These are navbar variables
		            loggedIn : req.isAuthenticated(),
		            projList : req.user.local.projects,
		            firstname : req.user.local.firstname,
		            projects : projs
		        });
		    }
        });
        
    });

};
