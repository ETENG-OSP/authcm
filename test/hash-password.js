var models = require('../models');
var faker = require('faker');
var bcrypt = require('bcrypt');
var assert = require('assert');
var jwt = require('jsonwebtoken');

var User = models.User;
var Application = models.Application;
var AccessToken = models.AccessToken;

var credentials = {
  username: faker.internet.userName(),
  password: faker.internet.password()
};

var userId;
var token;

describe('user', function() {
  describe('hash password', function() {

    it('create should be hash', function() {
      return User
        .create(credentials)
        .then(function(user) {
          userId = user.id;
          var result = bcrypt.compareSync(credentials.password, user.password);
          assert(result, 'password not match: ' + user.password);
        });
    });

    it('update should be hash', function() {
      var newPassword = faker.internet.password();
      return User
        .findById(userId)
        .then(function(user) {
          user.set('password', newPassword);
          return user.save();
        })
        .then(function() {
          return User
            .findById(userId);
        })
        .then(function(user) {
          var result = bcrypt.compareSync(newPassword, user.password);
          assert(result, 'password not match: ' + user.password);
        });
    });

  });

  describe('issue token and verify', function() {
    it('should have accesstoken', function() {
      return AccessToken.issue({
        iss: '1',
        aud: '2',
        sub: userId
      })
      .then(function(accessToken) {
        token = accessToken;
        console.log(token);
        return Application
          .findById('2');
      })
      .then(function(app) {
        var payload = jwt.verify(token.toString(), app.secret, {
          iss: '1',
          aud: '2'
        });
        assert(payload.sub === userId, 'user mismatch');
      });
    });
  });

  describe('not revoke check', function() {
    it('should not revoke', function() {
      return token
        .isRevoked()
        .then(function(result) {
          assert(result === false, 'token is revoked');
        });
    });
  });

  describe('revoke', function() {
    it('should set timestamp', function() {
      return token
        .revoke()
        .then(function() {
          return User.findById(userId);
        })
        .then(function(user) {
          assert(typeof user.revokedAt.getTime() === 'number', 'type mismatch');
        });
    })
  });

  describe('is revoke check', function() {
    it('should not pass', function() {
      return token
        .isRevoked()
        .then(function(result) {
          assert(result, 'token not revoke');
        });
    });
  });
});
