var Blacklist = require('../models').Blacklist;

var blacklistController = {
  isRevoked: isRevoked,
  revoke: revoke
};

function revoke(req, res, next) {
  var userId = req.cm.param('userId');
  Blacklist
    .revokeSubByIat(userId)
    .then(function() {
      res.json({message: 'ok'});
    })
    .catch(next);
}

function isRevoked(req, res, next) {
  var token = req.cm.param('token');
  Blacklist
    .isRevoked(token);
    .then(function(result) {
      res.json({
        banned: result
      });
    });
    .catch(next);
}

module.exports = blacklistController;
