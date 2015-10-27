var sequelize = require('../sequelize');

var User = require('./user')(sequelize);
var Application = require('./application')(sequelize);
var AccessToken = require('./access-token')();

User.belongsTo(Application);
Application.hasMany(User);

exports.User = User;
exports.Application = Application
exports.AccessToken = AccessToken;
