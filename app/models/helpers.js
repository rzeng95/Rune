var User = require('./user.js');

module.exports = {

    getUserProjects : function(inputEmail, callback) {
        User.findOne({'local.email': inputEmail}, function(err,usr){
            if (err) {
                callback(err);
            } else {
                var projList = usr.local.projects;
                callback(null, projList);
            }
        });
    } ,


    // Navbar variables:
    // * First Name (replaces "Log In" button if user is logged in)
    // * Project List (Project dropdown, different for each user)
    renderNavbar : function(req, callback) {

        // Note that the email being searched is ALWAYS that of the logged in user, since the Projects dropdown should only display projects of the logged-in user. 
        User.findOne({'local.email': req.user.local.email}, function(err,usr){
            if (err) {
                callback(err);
            } else {
                var firstName = usr.local.firstname;
                var projList = usr.local.projects;
                callback(null, firstname, projList);
            }
        })

    }





};
