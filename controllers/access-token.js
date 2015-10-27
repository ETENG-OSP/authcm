var models = require('../models');

var AccessToken = models.AccessToken;

module.exports = {

  isRevoked: function(req, res, next) {
    var token = req.cm.param('token');
    var accessToken = new AccessToken(token);

    return accessToken
      .isRevoked()
      .then(function(result) {
        return res.json({
          revoked: result
        });
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

    return accessToken
      .refresh()
      .then(function(token) {
        return res.json({
          token: token.toString()
        });
      })
      .catch(next);
  }

};
