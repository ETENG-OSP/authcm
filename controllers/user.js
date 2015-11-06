var models = require('../models');
var remoteMethod = require('../src/remote-method');
var resourceController = require('../src/resource-controller');
var nconf = require('../nconf');

var User = models.User;
var Application = models.Application;
var AccessToken = models.AccessToken;

var userController = resourceController(User);

userController.signup = remoteMethod(function* (req) {
  var credentials = req.cm.param('credentials');
  var appId = req.cm.appId();

  var user = yield User.signup(credentials, appId);
  return {
    userId: user.id
  };
});

userController.login = remoteMethod(function* (req) {
  var credentials = req.cm.param('credentials');
  var appId = req.cm.appId();

  var user = yield User.login(credentials, appId);
  var userId = user.id;
  var accessToken = yield AccessToken.issue(credentials.type, {
    sub: userId,
    aud: appId,
    iss: nconf.get('feature:id')
  });

  return {
    userId: userId,
    token: accessToken.toString()
  };
});

module.exports = userController;
