require('./app').start().then(function() {
  console.log('auth server start at %s', require('./nconf').get('port'));
});
