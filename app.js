var express = require('express');
var cors = require('cors');
var swaggerTools = require('swagger-tools');

var cmUtils = require('./cm-utils');
var nconf = require('./nconf');
var models = require('./models');
var swaggerObject = require('./api/swagger');

function errorHandler() {
  return function(err, req, res, next) {
    console.log('cmApiKeyhandle error:', err);
    res.status(500).json({
      message: err.message,
      detail: err
    });
  };
}

swaggerTools.initializeMiddleware(swaggerObject, function(middleware) {

  var routerOptions = {
    controllers: nconf.get('controllers')
  };

  var securityOptions = {
    cmApiKey: require('./cm-security')({
      id: nconf.get('feature:id'),
      secret: nconf.get('feature:secret')
    })
  };

  var app = express();
  app.use(cors());
  app.use(cmUtils());
  app.use(middleware.swaggerMetadata());
  app.use(middleware.swaggerSecurity(securityOptions));
  app.use(middleware.swaggerRouter(routerOptions));
  app.use(middleware.swaggerUi());
  app.use(errorHandler());
  // app.use(require('./inspector'));

  models.sequelize.sync().then(function() {

    app.listen(nconf.get('port'), function() {
      console.log('started');
    });

  });

});
