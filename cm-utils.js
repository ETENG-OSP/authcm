module.exports = function() {
  return function(req, res, next) {

    req.realm = function(Model) {
      return Model
        .scope({
          method: ['realm', req.appId()]
        });
    };

    req.param = function(name) {
      return req.swagger.params[name].value;
    };

    next();

  };
};
