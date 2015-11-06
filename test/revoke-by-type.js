var Promise = require('bluebird');
var assert = require('assert');
var faker = require('faker');
var requestAsync = Promise.promisify(require('request'));
var app = require('../src/app');

var authorization = {'cm-api-key': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyIiwiaXNzIjoiMSJ9.XrVM6EOHORin2ivhpUQXaoLliKRF5SKCGRfu5lYtDfs'};
var host = 'http://localhost:3002/';

var credentials = {
  username: faker.internet.userName(),
  password: faker.internet.password()
}

function signup() {
  return requestAsync({
    url: host + 'auth/signup',
    method: 'POST',
    body: credentials,
    json: true,
    qs: authorization
  });
}

function login(type) {
  return requestAsync({
    url: host + 'auth/login',
    method: 'POST',
    body: {
      username: credentials.username,
      password: credentials.password,
      type: type
    },
    json: true,
    qs: authorization
  }).spread(function(response, body) {
    return body.token;
  });
}

function validate(token) {
  return requestAsync({
    url: host + 'token/validate',
    method: 'POST',
    json: true,
    headers: authorization,
    qs: {
      token: token
    }
  }).spread(function(response, body) {
    return body.valid;
  });
}

function revoke(token) {
  return requestAsync({
    url: host + 'token/revoke',
    method: 'POST',
    json: true,
    headers: authorization,
    qs: {
      token: token
    }
  });
}


describe('user revoke test', function() {

  var token1, token2, token3;

  before(function() {
    return app.start();
  });

  describe('new token', function() {

    before(function() {
      return signup();
    });

    before(function() {
      return Promise.all([
        login('string'),
        login('string'),
        login('mobile')
      ]).then(function(token) {
        token1 = token[0];
        token2 = token[1];
        token3 = token[2];
      });
    });

    it('should be valid', function() {
      return Promise.all([
        validate(token1),
        validate(token2),
        validate(token3),
      ]).spread(function(result1, result2, result3) {
        assert(result1);
        assert(result2);
        assert(result3);
      });
    });

  });

  describe('revoked token', function() {

    before(function() {
      return revoke(token1);
    });

    it('shoud be not valid', function() {
      return validate(token1)
        .then(function(result) {
          assert(result === false);
        });
    });

    it('should be also not valid with same type', function() {
      return validate(token2)
        .then(function(result) {
          assert(result === false);
        });
    });

    it('should be valid with different type', function() {
      return validate(token3)
        .then(function(result) {
          assert(result);
        });
    });

  });

});
