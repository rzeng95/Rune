process.env.NODE_ENV = 'test';

var expect = require('chai').expect;

var request = require('supertest');

var app = require('../app');

describe('Passport authentication', function() {

    it('Unsuccessful logins redirect back to /login', function(done){
        request(app)
        .post('/login/')
        .type('form')
        .send({email: '@@@@' , password: 'a_fake_password'})
        .end(function(err,res) {
            expect(res.header.location).to.include('login');
            done(err);
        });

    });

    it('Successful logins redirect to /profile', function(done) {
        request(app)
        .post('/login/')
        .type('form')
        .send({email: 'rzeng0508@gmail.com' , password: 'hello'})
        .end(function(err,res) {
            expect(res.header.location).to.include('profile');
            done(err);
        });
    });


});
