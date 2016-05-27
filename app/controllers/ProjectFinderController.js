var Helper = require('../models/helpers.js');
var User = require('../models/user.js');
var Project = require('../models/project.js');
var async = require('async');

module.exports = function(app, passport) {
    app.get('/projectfinder', Helper.isLoggedIn,
        function(req, res) {
            async.waterfall([
                function(callback) {
                    Project.find({}, function(err, projs) {
                        if (err) {
                            throw err;
                        } else {
                            callback(null, projs);
                        }
                    });
                },
                function(projs, callback) {
                    User.find({}, function(err, usrs) {
                        if (err) {
                            throw err;
                        } else {
                            // Compile user info
                            var userList = [];
                            for (var i = 0; i < usrs.length; i++) {
                                userList.push({
                                    'name':usrs[i].local.firstname+' '+usrs[i].local.lastname,
                                    'initials':usrs[i].local.firstname.charAt(0)+usrs[i].local.lastname.charAt(0),
                                    'email':usrs[i].local.email,
                                    'id':usrs[i].local.userid,
                                    'color':usrs[i].local.userColor
                                });
                            }

                            var projects = [];
                            for (var i = 0; i < projs.length; i++) {
                                var admin = projs[i].admin;
                                var found = false;
                                for (var j = 0; j < userList.length; j++) {
                                    if (userList[j].email == admin) {
                                        found = true;
                                        projects.push({
                                            'name':projs[i].projectname,
                                            'initials':userList[j].initials,
                                            'color':userList[j].color,
                                            'leader':userList[j].name,
                                            'size':projs[i].members.length,
                                            'link':'/u/'+userList[j].id+'/',
                                            'description': projs[i].description,
                                            'projectskills' : projs[i].projectskills
                                        });
                                    }
                                }
                                if (!found) {
                                    projects.push({
                                        'name':projs[i].projectname,
                                        'initials':'??',
                                        'color':'red',
                                        'leader':admin,
                                        'size':projs[i].members.length,
                                        'link':'#',
                                        'description': projs[i].description,
                                        'projectskills' : projs[i].projectskills
                                    });
                                }
                            }


                            res.render('projectfinder.jade', {
                            // These are navbar variables
                                loggedIn : req.isAuthenticated(),
                                projList : req.user.local.projects,
                                firstname : req.user.local.firstname,


                                projects : projects,
                                users : userList
                            });
                        }
                    });
                }
            ]);
        }
    );
};
