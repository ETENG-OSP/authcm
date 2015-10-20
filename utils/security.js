var jwt = require('jsonwebtoken');
var debuglog = require('util').debuglog('security');
var assert = require('assert');

module.exports = function(config) {

  var featureId = config.id;
  var featureSecret = config.secret;
  var tokenName = config.tokenName || 'cm-api-key';

  assert(featureId, 'must set feature id');
  assert(featureSecret, 'must set feature secret');

  debuglog('feature id is: %s', featureId);
  debuglog('feature secret is: %s', featureSecret);

  return function(req, res, next) {

    req.cm = req.cm || {};

    req.cm.apiKey = function() {
      var token = getToken();
      console.log('get api key', token);
      assert(token, 'token must set');
      return token;
    };

    req.cm.appId = function() {
      return req.cm.payload.aud;
    };

    return verify();

    function verify() {
      try {
        var apiKey = req.cm.apiKey();
        var payload = jwt.verify(apiKey, featureSecret, {issuer: featureId});
        req.cm.payload = payload;
        next();
      } catch (err) {
        next(err);
      }
    }

    function getToken() {
      var token;
      var currentName;
      if (Array.isArray(tokenName)) {
        for (var i = 0; i < tokenName.length; ++i) {
          currentName = tokenName[i];
          token = req.get(currentName) || req.query[currentName];
          if (token) break;
        }
      } else {
        token = req.get(tokenName) || req.query[tokenName];
      }

      return token;
    }

  };

};
