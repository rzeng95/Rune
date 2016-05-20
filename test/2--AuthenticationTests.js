process.env.NODE_ENV = 'test';

var expect = require('chai').expect;

var request = require('supertest');

var app = require('../app');

var User = require('../app/models/user.js');

describe('Passport authentication', function() {

    before(function(done) {
        User.collection.drop();
        done();
    });

    it('Unsuccessful logins redirect back to /login', function(done){
        request(app)
        .post('/login/')
        .type('form')
        .send({email: '@@@@' , password: 'a_fake_password'})
        .end(function(err,res) {
            expect(res.header.location).to.equal('/login');
            done(err);
        });

    });

    it('Successful signups redirect to /profile', function(done) {
        request(app)
        .post('/signup')
        .type('form')
        .send({firstname: 'roland', lastname: 'zeng', email:'rzeng0508@gmail.com', password: 'hello', userColor : 'yelloworange'})
        .end(function(err,res) {
            expect(res.header.location).to.equal('/profile');
            done(err);
        })
    });

    it('Successful logins redirect to /profile', function(done) {
        request(app)
        .post('/login/')
        .type('form')
        .send({email: 'rzeng0508@gmail.com' , password: 'hello'})
        .end(function(err,res) {
            expect(res.header.location).to.equal('/profile');
            done(err);
        });
    });

    it('Successful logouts redirect to homepage', function(done) {
        request(app)
        .post('/login/')
        .type('form')
        .send({email: 'rzeng0508@gmail.com' , password: 'hello'})
        .end(function(err,res) {
            request(app)
            .get('/logout/')
            .end(function(err2,res2){
                expect(res2.header.location).to.equal('/');
                done(err2);
            });
        });
    });


    afterEach(function(done) {
        request(app)
        .get('/logout/')
        .end(function(err,res) {
            done(err);
        });
    });

    after(function(done) {
        User.collection.drop();
        done();
    });
});
