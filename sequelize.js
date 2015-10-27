var Sequelize = require('sequelize');

var nconf = require('./nconf');

var database = nconf.get('database');
var username = nconf.get('username');
var password = nconf.get('passoword');
var options = {
  dialect: nconf.get('dialect'),
  storage: __dirname + '/' + nconf.get('storage')
};

var sequelize = new Sequelize(database, username, password, options);

module.exports = sequelize;
