'use strict';

var express = require('express');
var cors = require('cors');
var swaggerTools = require('swagger-tools');
var errorhandler = require('errorhandler');
var Promise = require('bluebird');
var morgan = require('morgan');

var security = require('./security');
var param = require('./param');

class Application {

  constructor() {
    this.options = require('../nconf').get();
    this.swaggerObject = require('../api/swagger');
    this.corsOptions = {
      exposedHeaders: ['X-Total-Count']
    };
    this.routerOptions = {
      controllers: `${__dirname}/../${this.options.swagger.controllers}`
    };
    this.securityOptions = {
      tokenName: this.options.security.tokenName,
      id: this.options.feature.id,
      secret: this.options.feature.secret
    };
    this.corsOptions = {
      exposedHeaders: ['X-Total-Count']
    };
  }

  initialize() {
    var app = express();
    this.app = app;
    var deferred = Promise.defer();
    swaggerTools.initializeMiddleware(this.swaggerObject, (middleware) => {
      this.loadMiddlewares(middleware);
      deferred.resolve(app);
    });
    return deferred.promise;
  }

  loadMiddlewares(middleware) {
    var app = this.app;

    app.use(cors(this.corsOptions));
    app.use(middleware.swaggerUi());
    app.use(morgan('combined'));
    app.use(security(this.securityOptions));
    app.use(param());
    app.use(middleware.swaggerMetadata());
    app.use(middleware.swaggerRouter(this.routerOptions));
    app.use(errorhandler());
    // app.use(require('./inspector'));
  }

  start() {
    return this.initialize().then((app) => {
      var deferred = Promise.defer();
      app.listen(this.options.port, function() {
        deferred.resolve();
      });
      return deferred.promise;
    });
  }

}

module.exports = new Application();
