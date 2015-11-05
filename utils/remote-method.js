var Promise = require('bluebird');

function remoteMethodFactory(method) {
  return function(req, res, next) {
    var task = Promise.coroutine(method);
    task(req, res, next)
      .then(res.json.bind(res))
      .catch(next);
  };
}

module.exports = remoteMethodFactory;
