var remoteMethod = require('./remote-method');
var query = require('./query');

function resourceControllerFactory(Model) {

  return {

    findAll: remoteMethod(function* (req, res) {
      var results = yield Model.findAndCountAll({
        where: query.getWhere(req),
        include: query.getInclude(req, Model),
        order: query.getOrder(req),
        offset: query.getOffset(req),
        limit: query.getLimit(req)
      });

      var count = results.count;
      var instances = results.rows;

      res.set('X-Total-Count', count);
      return instances;
    }),

    create: remoteMethod(function* (req, res) {
      var data = req.cm.param('data');
      var appId = req.cm.appId();
      data.applicationId = appId;

      var instance = yield Model.create(data);
      return instance;
    }),

    findById: remoteMethod(function* (req, res, next) {
      var id = req.cm.param('id');

      return yield Model.findById(id, {
        include: query.getInclude(req, Model)
      });
    }),

    update: remoteMethod(function* (req, res) {
      var id = req.cm.param('id');
      var data = req.cm.param('data');

      var instance = yield Model.findById(id);
      return yield instance.update(data);
    }),

    destroy: remoteMethod(function* (req, res) {
      var id = req.cm.param('id');

      var instance = yield Model.findById(id);
      return yield instance.destroy();
    })

  };

}

module.exports = resourceControllerFactory;
