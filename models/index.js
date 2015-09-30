var Sequelize = require('sequelize');
var nconf = require('../nconf');

var database = nconf.get('database');
var username = nconf.get('username');
var password = nconf.get('passoword');
var options = {
  dialect: nconf.get('dialect'),
  storage: nconf.get('storage')
};

var sequelize = new Sequelize(database, username, password, options);

var User = require('./user')(sequelize);
var Application = require('./application')(sequelize);

User.belongsTo(Application);
Application.hasMany(User);

exports.sequelize = sequelize;
exports.User = User;
exports.Application = Application;
