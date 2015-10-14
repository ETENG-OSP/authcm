var Sequelize = require('sequelize');
var uuid = require('uuid');

module.exports = function(sequelize) {

  return sequelize.define('application', {

    id: {
      type: Sequelize.CHAR(36).BINARY,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4
    },

    secret: {
      type: Sequelize.STRING,
      defaultValue: function() {
        return new Buffer(uuid.v4()).toString('base64');
      }
    }

  }, {

    classMethods: {

      install: function(id, secret) {
        var Application = this;
        return Application.create({
          id: id,
          secret: secret
        });
      }

    }

  });

};
