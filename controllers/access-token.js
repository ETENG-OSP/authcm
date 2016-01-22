var models = require('../models');
var Promise = require('bluebird');

var AccessToken = models.AccessToken;

module.exports = {

  validate: function(req, res, next) {
    var token = req.cm.param('token');
    var accessToken = new AccessToken(token);

    return Promise
      .all([
        accessToken.isRevoked(),
        accessToken.verify()
      ])
      .spread(function(revoked) {
        return res.json({valid: !revoked});
      })
      .catch(next);
  },

  revoke: function(req, res, next) {
    var token = req.cm.param('token');
    var accessToken = new AccessToken(token);

    return accessToken
      .revoke()
      .then(function() {
        return res.json({
          message: 'ok'
        });
      })
      .catch(next);
  },

  refresh: function(req, res, next) {
    var token = req.cm.param('token');
    var accessToken = new AccessToken(token);
    var type = req.cm.param('type');

    return accessToken
      .refresh(type)
      .then(function(token) {
        return res.json({
          token: token.toString()
        });
      })
      .catch(next);
  }

};
