var jwt = require('jsonwebtoken');
var debuglog = require('util').debuglog('security');
var assert = require('assert');

var nconf = require('./nconf');

module.exports = function(config) {

  assert(config.id, 'must set feature id');
  assert(config.secret, 'must set feature secret');

  debuglog('feature id is: %s', config.id);
  debuglog('feature secret is: %s', config.secret);

  return function(req, secdef, apiKey, callback) {

    try {

      var payload = jwt.verify(apiKey, config.secret, {
        issuer: config.id
      });

      req.cm = {
        appId: payload.aud
      };

      callback();

    } catch(err) {

      callback(err);

    }

  };

};
