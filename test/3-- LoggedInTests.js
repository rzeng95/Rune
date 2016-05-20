process.env.NODE_ENV = 'test';

var expect = require('chai').expect;

var request = require('supertest');

var app = require('../app');

var User = require('../app/models/user.js');
var Project = require('../app/models/project.js');

describe('Accessing pages while logged in', function() {

    var userID;

    var loginHelper = function() {
        return request(app)
                .post('/login/')
                .type('form')
                //.set('Content-Type', 'multipart/form-data')
                //.send({email: 'qa@rune.com' , password: 'hello'})
                .field('email', 'qa@rune.com')
                .field('password', 'hello')

    }

    before(function(done) {
        User.collection.drop();
        Project.collection.drop();

        // Rather than using the signup endpoint to create a new user, we'll just generate one directly
        var newUser = new User();

        newUser.local.firstname = 'Quality';
        newUser.local.lastname = 'Assurance';
        newUser.local.email    = 'qa@rune.com';
        newUser.local.password = newUser.generateHash('hello');
        newUser.local.userid = (newUser._id).toString();
        newUser.local.userColor = 'purple';

        userID = newUser.local.userid;
        //console.log(userID);
        newUser.save(function(err) {
            if (err) throw err;
            else {/*
                request(app)
                .post('/login/')
                .type('form')
                .send({email: 'qa@rune.com' , password: 'hello'})
                .end(function(err,res) {
                    expect(res.header.location).to.equal('/profile');
                    done(err);
                });
                */
                done(err);

            }
        })
    });

    it('When logged in, profile page does not redirect back to login', function(done){
        request(app)
        .get('/profile')
        .end(function(err,res) {
            //console.log(res.header);
            expect(res.header.location).to.equal('/profile/');
            done(err);
        });
    });

    it('Logging in redirects to profile', function(done) {
        request(app)
        .post('/login/')
        .type('form')
        .send({email: 'qa@rune.com' , password: 'hello'})
        .end(function(err,res) {
            expect(res.header.location).to.equal('/profile');
            done(err);
        });

    });
/*
    it('Dank', function(done) {
        loginHelper()
            .end(function(err,res) {
                console.log(res.header.location);
                done(err);
            })

    });
    */
/*
    it('When logged in, can access individual user profile page', function(done) {
        request(app)
        .get('/u/' + userID + 'e/')
        //.expect(200)
        .end(function(err,res){
            console.log(userID);
            console.log(res.header);
            done(err);
        });
    })
*/

    after(function(done) {
        //User.collection.drop();
        //Project.collection.drop();
        done();
    });
});
