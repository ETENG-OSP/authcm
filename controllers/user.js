var models = require('../models');
var resourceController = require('../utils/resource-controller');
var nconf = require('../nconf');

var User = models.User;
var Application = models.Application;
var AccessToken = models.AccessToken;

var userController = resourceController(User);

userController.signup = signup;
userController.login = login;

function signup(req, res, next) {
  var credentials = req.cm.param('credentials');
  var appId = req.cm.appId();

  return User
    .signup(credentials, appId)
    .then(function(user) {
      return res.json({
        userId: user.id
      });
    })
    .catch(next);
}

function login(req, res, next) {
  var credentials = req.cm.param('credentials');
  var appId = req.cm.appId();
  var userId;

  return User
    .login(credentials, appId)
    .then(function(user) {
      userId = user.id;
      return AccessToken.issue({
        sub: userId,
        aud: appId,
        iss: nconf.get('feature:id')
      });
    })
    .then(function(accessToken) {
      return res.json({
        userId: userId,
        token: accessToken.toString()
      });
    })
    .catch(next);
}

module.exports = userController;
