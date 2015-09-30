var nconf = require('./nconf');
nconf.file({file: './config.development.json'});

var models = require('./models');

models
  .sequelize
  .sync()
  .then(function() {
    var Application = models.Application;
    var data = require('./applications.json');
    return Application.bulkCreate(data);
  })
  .then(function() {
    var User = models.User;
    var data = require('./users');
    return User.bulkCreate(data.map(function(record) {
      record.applicationId = '2';
      return record;
    }));
  })
  .then(function() {
    console.log('done');
  });
