var Helper = require('../models/helpers.js');
var User = require('../models/user.js');
var Project = require('../models/project.js');
var async = require('async');

module.exports = function(app, passport) {
    app.get('/projectfinder', Helper.isLoggedIn,
        function(req, res) {
            async.waterfall([
                function(callback) {
                    Project.find({'ispublic' : true}, function(err, projs) {
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

                                // dont show project if you're already a member of the project
                                if(projs[i].members.indexOf(req.user.local.email)!=-1 )
                                    continue;

                                var admin = projs[i].admin;
                                var found = false;

                                if(projs[i].pending.indexOf(req.user.local.userid)==-1)
                                    var disabled = false
                                else
                                    var disabled = true

                                for (var j = 0; j < userList.length; j++) {
                                    if (userList[j].email == admin) {
                                        found = true;
                                        console.log(projs[i].pending)
                                        console.log(projs[i].projectid)
                                        projects.push({
                                            'name':projs[i].projectname,
                                            'initials':userList[j].initials,
                                            'color':userList[j].color,
                                            'leader':userList[j].name,
                                            'size':projs[i].members.length,
                                            'link':'/u/'+userList[j].id+'/',
                                            'description': projs[i].description,
                                            'projectskills' : projs[i].projectskills,
                                            'projectid' : projs[i].projectid,
                                            'disabled' : disabled

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
    app.post('/projectfinder/apply', Helper.isLoggedIn, 
        function(req, res) {
            console.log(req.body.project);
            // finds the project being applied to 
            Project.findById(req.body.project, function(err, foundProj){
                
                // checks if user is already in pending. if user is not, array search will return -1
                if(foundProj.pending.indexOf(req.user.local.userid) == -1)
                {
                    console.log(req.user.local.userid);
                    // adds user's id to the array
                    foundProj.pending.push(req.user.local.userid);
                    foundProj.save(function(err){
                        if (err) throw err;
                        else {
                            res.redirect('/projectfinder');
                        }

                    });
                }
                else
                    res.redirect('/projectfinder');
            });
            
        });
};
