process.env.NODE_ENV = 'test';

var expect = require('chai').expect;

var request = require('supertest');

var app = require('../app');

describe('Accessing pages while not logged in', function() {

    it('accessing homepage should return a 200 reponse', function(done) {
        request(app)
        .get('/')
        .expect(200)
        .end(done);
    });

    it('accessing profile should redirect to login', function(done) {
        request(app)
        .get('/profile/')
        .end(function(err,res) {
            expect(res.header.location).to.include('login');
            done(err);
        });
    });

    it('accessing users list should redirect to login', function(done) {
        request(app)
        .get('/users/')
        .end(function(err,res) {
            expect(res.header.location).to.include('login');
            done(err);
        });
    });

    it('accessing any user page should redirect to login', function(done) {
        request(app)
        .get('/u/1/')
        .end(function(err,res) {
            expect(res.header.location).to.include('login');
            done(err);
        });
    })

    it('accessing any project page should redirect to login', function(done) {
        request(app)
        .get('/p/1/')
        .end(function(err,res) {
            expect(res.header.location).to.include('login');
            done(err);
        });
    })

    it('accessing any task on any project page should redirect to login', function(done) {
        request(app)
        .get('/p/1/t/1/')
        .end(function(err,res) {
            expect(res.header.location).to.include('login');
            done(err);
        });
    })

    it('accessing nonexistent endpoints routes to 404 handler', function(done) {
        request(app)
        .get('/blah/')
        .end(function(err,res) {
            expect(res.status).to.equal(404);
            done(err);
        });
    })


});
