var jwt = require('jsonwebtoken');
var nconf = require('../nconf');

module.exports = function() {

  function AccessToken(token) {
    this.token = token;
  }

  AccessToken.issue = function(payload) {
    var Application = require('./index').Application;
    return Application
      .findById(payload.aud)
      .then(function(application) {
        var token = jwt.sign({}, application.secret, {
          audience: payload.aud,
          subject: payload.sub,
          issuer: payload.iss,
          expiresIn: '7d'
        });
        return new AccessToken(token);
      });
  };

  AccessToken.prototype.verify = function() {
    var Application = require('./index').Application;
    var token = this.token;
    var appId = jwt.decode(token).aud;
    return Application
      .findById(appId)
      .then(function(application) {
        var payload = jwt.verify(token, application.secret, {
          issuer: nconf.get('feature:id')
        });
        return payload;
      });
  };

  AccessToken.prototype.revoke = function() {
    var token = this.token;
    var userId = jwt.decode(token).sub;
    var User = require('./index').User;
    return User
      .findById(userId)
      .then(function(user) {
        user.set('revokedAt', Date.now());
        return user.save();
      });
  };

  AccessToken.prototype.isRevoked = function() {
    var token = this.token;
    var payload = jwt.decode(token);
    var User = require('./index').User;
    return User
      .findById(payload.sub)
      .then(function(user) {
        if (!user || !user.revokedAt) {
          return false;
        }
        var revokedTimestamp = Math.floor(user.revokedAt.getTime() / 1000);
        if (revokedTimestamp < payload.iat) {
          return false;
        }
        return true;
      });
  };

  AccessToken.prototype.refresh = function() {
    var self = this;
    return this
      .verify()
      .then(function(payload) {
        return Promise.all([
          self.isRevoked(),
          AccessToken.issue(payload)
        ]);
      })
      .spread(function(isRevoked, newAccessToken) {
        if (isRevoked) {
          throw new Error('token 已经被吊销');
        }
        return newAccessToken;
      });
  };

  AccessToken.prototype.toString = function() {
    return this.token;
  };

  return AccessToken;

};
