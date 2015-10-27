var jwt = require('jsonwebtoken');

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

  AccessToken.prototype.verify = function(featureId) {
    var token = this.token;
    var appId = jwt.decode(token).aud;
    return Application
      .findById(appId)
      .then(function(application) {
        var payload = jwt.verify(token, application.secret, {
          issuer: featureId
        });
        return payload;
      })
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
    var payload = jwt.decode(token);
    var User = require('./index').User;
    return User
      .findById(payload.sub)
      .then(function(user) {
        if (!user || user.revokedAt < payload.iat) {
          return false;
        }
        return true;
      });
  };

  AccessToken.prototype.refresh = function() {
    return this
      .verify()
      .then(function(payload) {
        return AccessToken.issue(payload);
      });
  };

  AccessToken.prototype.toString = function() {
    return this.token;
  };

  return AccessToken;

};

function createTimestamp() {
  return Math.floor(Date.now() / 1000);
}
