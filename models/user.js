var Sequelize = require('sequelize');
var assert = require('assert');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var uuid = require('uuid');

module.exports = function(sequelize) {

  return sequelize.define('user', {

    id: {
      type: 'string',
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4
    },

    username: {
      type: 'string',
      allowNull: false
    },

    disabled: Sequelize.BOOLEAN,

    password: {
      type: 'string',
      allowNull: false
    }

  }, {

    indexes: [
      {
        unique: true,
        fields: ['username', 'applicationId']
      }
    ],

    classMethods: {

      login: function(credentials) {
        var User = this;
        return User
          .findOne({
            where: {username: credentials.username}
          })
          .then(function(user) {
            if (!user) {
              throw new Error('用户不存在');
            }
            if (user.disabled) {
              throw new Error('用户被禁用');
            }
            return user.comparePassword(credentials.password);
          });
      },

      signup: function(credentials, appId) {
        assert(appId, 'must have appId');
        var User = this;
        var Application = require('./index').Application;

        return Application
          .findOrCreate({
            where: {
              id: appId
            }
          })
          .then(function() {
            return User
              .create({
                username: credentials.username,
                password: credentials.password,
                applicationId: appId
              });
          });
      }

    },

    instanceMethods: {

      createAccessToken: function(issuer) {
        var user = this;
        return user
          .getApplication()
          .then(function(application) {
            var secret = application.secret;
            var userId = user.id;
            var appId = application.id;

            return jwt.sign({}, secret, {
              audience: appId,
              subject: userId,
              issuer: issuer,
              expiresIn: '7d'
            });
          });
      },

      comparePassword: function(password) {
        var user = this;
        return new Promise(function(resolve, reject) {
          bcrypt.compare(password, user.password, function(err, match) {
            if (err) {
              return reject(err);
            }
            if (!match) {
              return reject(new Error('用户名与密码不匹配'));
            }
            resolve(user);
          });
        });
      }

    },

    hooks: {
      beforeCreate: hashPassword,
      beforeUpdate: hashPassword,
      beforeBulkUpdate: bulkHashPassword
    },

    scopes: {
      realm: function(value) {
        return {
          where: {
            applicationId: value
          }
        };
      }
    }

  });

};

function hashPassword(user, options) {
  // console.log('======== hash password');
  // console.log(user);
  return new Promise(function(resolve, reject) {
    bcrypt.hash(user.password, 8, function(err, hash) {
      if (err) return reject(err);
      user.password = hash;
      resolve();
    });
  });
}

function bulkHashPassword(name, fn) {
  // console.log('======== bulk hash password');

  if (name.attributes.password) {
    return hashPassword(name.attributes)
      .then(function() {
        console.log('===== bulk hash done');
        console.log(name);
        fn();
      });
  } else {
    return fn();
  }

}
