var jwt = require('jsonwebtoken');
var Promise = require('bluebird');
var nconf = require('../nconf');

module.exports = function() {

  function AccessToken(token) {
    this.token = token;
  }

  AccessToken.issue = function(type, payload) {
    var Application = require('./index').Application;
    return Application
      .findById(payload.aud)
      .then(function(application) {
        var token = jwt.sign({
          type: type
        }, application.secret, {
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

  AccessToken.prototype.revoke = Promise.coroutine(function* (type) {
    var User = require('./index').User;
    var token = this.token;
    var payload = jwt.decode(token);

    var user = yield User.findById(payload.sub);
    var revokedAt = user.revokedAt || {};
    if(type)
      payload.type = type;
    revokedAt[payload.type] = Math.floor(Date.now() / 1000);
    user.set('revokedAt', revokedAt);
    return yield user.save();
  });

  AccessToken.prototype.isRevoked = Promise.coroutine(function* () {
    var User = require('./index').User;
    var token = this.token;
    var payload = jwt.decode(token);

    var user = yield User.findById(payload.sub);
    if (!user || !user.revokedAt) {
      return false;
    }
    var revokedTimestamp = user.revokedAt[payload.type];
    if (!revokedTimestamp) {
      return false;
    }
    if (revokedTimestamp <= payload.iat) {
      return false;
    }
    return true;
  });

  AccessToken.prototype.refresh = function(type) {
    var self = this;
    return this
      .verify()
      .then(function(payload) {
        if(type)payload.type = type;
        return Promise.all([
          self.isRevoked(),
          AccessToken.issue(payload.type, payload)
        ]);
      })
      .spread(function(isRevoked, newAccessToken) {
        if (isRevoked) {
          throw new Error('token 已经被吊销');
        }
        return newAccessToken;
      });
  };

  AccessToken.prototype.refreshAndInvoke = function(type){
    var self=this;
    return this
        .verify()
        .then(function(payload) {
          if(type)payload.type = type;
          return Promise.all([
            self.isRevoked(),
            self.revoke(type),
            AccessToken.issue(payload.type, payload)
          ]);
        })
        .spread(function(isRevoked, newAccessToken) {
          return newAccessToken;
        });
  };

  AccessToken.prototype.toString = function() {
    return this.token;
  };

  return AccessToken;

};
