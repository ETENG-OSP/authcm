module.exports = function() {
  return function(req, res, next) {

    req.cm = req.cm || {};

    req.cm.param = function(name) {
      try {
        return req.swagger.params[name].value;
      } catch (e) {
        throw new Error('param ' + name + ' not found');
      }
    };

    next();
  };
};
