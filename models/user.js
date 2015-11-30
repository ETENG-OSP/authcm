var Sequelize = require('sequelize');
var assert = require('assert');
var bcrypt = require('bcrypt');
var uuid = require('uuid');
var _ = require('underscore');

module.exports = function(sequelize) {

  var User = sequelize.define('user', {

    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4
    },

    username: {
      type: Sequelize.STRING(128),
      allowNull: false
    },

    disabled: Sequelize.BOOLEAN,

    password: {
      type: Sequelize.STRING,
      allowNull: false
    },

    revokedAt: {
      type: Sequelize.TEXT,
      get: function() {
        try {
          var result = JSON.parse(this.getDataValue('revokedAt'));
          return result;
        } catch (err) {
          return;
        }
      },
      set: function(val) {
        try {
          return this.setDataValue('revokedAt', JSON.stringify(val));
        } catch (err) {
          return;
        }
      }
    }

  }, {

    indexes: [
      {
        unique: true,
        fields: ['username', 'applicationId']
      }
    ],

    classMethods: {

      login: function(credentials, appId) {
        var User = this;
        return User
          .findOne({
            where: {username: credentials.username, applicationId: appId}
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
            where: {id: appId}
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
      beforeCreate: [hashPassword, setRevokedAt],
      beforeUpdate: [hashPassword, setRevokedAt]
    }

  });
  return User;

  function setRevokedAt(user, options, done) {
    if (user.disabled) {
      user.revokedAt = _.mapObject(user.revokedAt, function(val, key) {
        return Date.now();
      });
      return done();
    }else{
      done();
    }

  }

};



function hashPassword(user, options, done) {
  if (!user.changed('password')) {
    return done();
  }

  bcrypt.hash(user.password, 8, function(err, hash) {
    if (err) throw err;
    user.password = hash;
    done();
  });
}
