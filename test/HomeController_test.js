var expect = require('chai').expect;

var request = require('supertest');
var app = require('../app');
var agent = request.agent(app);

describe('Homepage', function() {

    it('should return a 200 reponse', function(done) {
        agent
        .get('/')
        .expect(200)
        .end(done);
    });

});
