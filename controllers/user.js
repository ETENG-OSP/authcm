var User = require('../models').User;
var Application = require('../models').Application;
var resourceController = require('../utils/resource-controller');
var nconf = require('../nconf');

var userController = resourceController(User);

userController.signup = signup;
userController.login = login;

function signup(req, res, next) {
  var credentials = req.cm.param('credentials');
  var appId = req.cm.appId();
  User
    .signup(credentials, appId)
    .then(function(user) {
      res.json({
        userId: user.id
      });
    })
    .catch(next);
}

function login(req, res, next) {
  var credentials = req.cm.param('credentials');
  var appId = req.cm.appId();
  User
    .login(credentials, appId)
    .then(function(user) {
      user
        .createAccessToken(nconf.get('feature:id'))
        .then(function(token) {
          res.json({
            userId: user.id,
            token: token
          });
        });
    })
    .catch(next);
}

function refresh(req, res, next) {
  jwt.sign();
}

module.exports = userController;
