var LocalStrategy = require('passport-local').Strategy;

var User = require('../app/models/user');

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    }, function(req, email, password, done) { // callback with email and password from our form

        var emailProcessed = email.replace(/\s/g,'');
        
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({
            'local.email' :  emailProcessed
        }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err) {
                return done(err);
            }

            // if no user is found or the password is invalid, return this message
            if (!user || !user.validPassword(password)) {
                return done(null, false, req.flash('loginMessage', 'Incorrect username or password')); // req.flash is the way to set flashdata using connect-flash
            }

            // all is well, return successful user
            return done(null, user);
        });
    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    }, function(req, email, password, done) {
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({
                'local.email' : email
            }, function(err, user) {
                // if there are any errors, return the error
                if (err) {
                    return done(err);
                }

                // check to see if theres already a user with that email
                if (user) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                } else {
                    // if there is no user with that email
                    // create the user
                    var newUser = new User();

                    var firstNameRaw = req.body.firstname;
                    var lastNameRaw = req.body.lastname;
                    var firstNameProcessed = firstNameRaw[0].toUpperCase() + firstNameRaw.slice(1);
                    var lastNameProcessed = lastNameRaw[0].toUpperCase() + lastNameRaw.slice(1);
                    var emailProcessed = email.replace(/\s/g,'');

                    // set the user's local credentials
                    newUser.local.firstname = firstNameProcessed;
                    newUser.local.lastname = lastNameProcessed;
                    newUser.local.email    = emailProcessed;
                    newUser.local.password = newUser.generateHash(password);
                    newUser.local.userid = (newUser._id).toString();
                    newUser.local.userColor = req.body.userColor;

                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });
    }));
};
