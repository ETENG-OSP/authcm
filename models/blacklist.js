var Sequelize = require('sequelize');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize) {

  sequelize.define('blacklist', {
    sub: {
      type: Sequelize.STRING,
      unique: true
    },
    iat: Sequelize.INTEGER
  }, {

    classMethods: {

      revoke: function(token) {
        var userId = jwt.decode(token).sub;
        return this.findOne({
          where: {sub: userId}
        })
        .then(function(blacklist) {
          blacklist.iat = Math.floor(Date.now() / 1000);
          return blacklist.save();
        })
      },

      isRevoked: function(token) {
        var payload = jwt.decode(token);
        return this
          .findOne({
            where: {userId: payload.sub}
          })
          .then(function(banned) {
            if (!banned || banned.iat < payload.iat) {
              return false;
            }
            return true;
          });
      }

    }

  });

};
