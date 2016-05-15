var expect = require('chai').expect;
var should  = require('chai').should;

var request = require('supertest');
var app = require('../app');
var agent = request.agent(app);

describe('Login Page', function() {

    it('accessing login page should return a 200 reponse', function(done) {
        agent
        .get('/login/')
        .expect(200)
        .end(done);
    });
    it('accessing pages while not logged in should redirect to /login', function(done) {
        agent
        .get('/profile/')
        .expect('Location', /\/login/)
        .end(done);
    });
/*
    it('logging in should redirect to /profile', function(done) {
        agent
        .post('/login/')
        .send({email: 'roland.zeng@gmail.com' , password: 'hello'})
        .expect({success:true}, done);
        //.expect('Location', /\/profile/)
        //.end(done);
    });
*/


/*
    it('should successfully login', function(done) {
        agent
        .post('/login/')
        .send({email: 'roland.zeng@gmail.com' , password: 'hello'})
        //.get('/profile')
        .expect('Location', /\//, done);
        //.expect(res.header['location']).to.include('/profile');
        //.end(function(err,res) {
            //console.log(res.header['location']);
            //console.log(res);
            //done();
        //});
    });
*/
});
