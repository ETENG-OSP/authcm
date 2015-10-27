var models = require('./models');
var sequelize = require('./sequelize');

sequelize.sync().then(function() {
  console.log('ok');
});
