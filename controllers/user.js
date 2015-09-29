var User = require('../models').User;
var Application = require('../models').Application;

function signup(req, res, next) {
  User
    .signup(req.param('credentials'), req.appId())
    .then(function(user) {
      res.json({
        userId: user.id
      });
    })
    .catch(next);
}

function login(req, res, next) {
  req
    .realm(User)
    .login(req.param('credentials'))
    .then(function(user) {
      user
        .createAccessToken()
        .then(function(token) {
          res.json({
            userId: user.id,
            token: token
          });
        });
    })
    .catch(next);
}

function findAll(req, res, next) {
  req
    .realm(User)
    .findAll()
    .then(function(users) {
      res.json(users.map(function(user) {
        var data = user.get({plain: true});
        delete data.applicationId;
        delete data.password;
        delete data.createdAt;
        delete data.updatedAt;
        return data;
      }));
    })
    .catch(next);
}

function create(req, res, next) {
  User
    .signup(req.param('data'), req.appId())
    .then(function(user) {
      res.json(user);
    })
    .catch(next);
}

function findOne(req, res, next) {
  req
    .realm(User)
    .findOne({
      where: {id: req.param('id')}
    })
    .then(function(user) {
      res.json(user);
    })
    .catch(next);
}

function update(req, res, next) {
  req
    .realm(User)
    .update(req.param('data'), {
      where: {id: req.param('id')}
    })
    .spread(function(count) {
      if (count === 0) throw new Error('没找到');
      res.json({
        message: '成功'
      });
    })
    .catch(next);
}

function destroy(req, res, next) {
  req
    .realm(User)
    .destroy({
      where: {
        id: req.param('id')
      }
    })
    .then(function(count) {
      if (count === 0) throw new Error('没找到');
      res.json({
        message: '成功'
      });
    })
    .catch(next);
}

exports.login = login;
exports.signup = signup;

exports.findAll = findAll;
exports.create = create;
exports.findOne = findOne;
exports.destroy = destroy;
exports.update = update;
