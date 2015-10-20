var _ = require('underscore');
var models = require('../models');

function resourceControllerFactory(Model, related) {

  return {

    findAll: function(req, res, next) {
      Model
        .findAndCountAll({
          where: getWhere(req),
          include: getInclude(req, Model),
          order: getOrder(req),
          offset: getOffset(req),
          limit: getLimit(req)
        })
        .then(function(result) {
          var count = result.count;
          var entities = result.rows;
          res.set('X-Total-Count', count);
          res.json(entities);
        })
        .catch(next);
    },

    create: function(req, res, next) {
      var data = req.cm.param('data');
      var appId = req.cm.appId();

      data.applicationId = appId;

      Model
        .create(data)
        .then(function(entity) {
          res.json(entity);
        })
        .catch(next);
    },

    findById: function(req, res, next) {
      var id = req.cm.param('id');

      Model
        .findById(id, {
          include: getInclude(req, Model)
        })
        .then(function(entity) {
          res.json(entity);
        })
        .catch(next);
    },

    update: function(req, res, next) {
      var id = req.cm.param('id');
      var data = req.cm.param('data');

      return Model
        .update(data, {where: {id: id}})
        .then(function(result) {
          return Model.findOne({where: {id: id}});
        })
        .then(function(entity) {
          // return res.json(entity);
          return updateRelated(entity, data, related)
            .then(function() {
              return res.json(entity);
            });
        })
        .catch(next);
    },

    destroy: function(req, res, next) {
      var id = req.cm.param('id');
      Model
        .destroy({where: {id: id}})
        .then(function(count) {
          res.json({
            message: 'ok',
            detail: {count: count}
          });
        })
        .catch(next);
    }

  };

}

function updateRelated(entity, data, related) {
  var taskArray = _.reduce(data, function(memo, value, key) {
    if (value && related && related[key]) {
      var fnName = 'set' + capitalizeFirstLetter(key);

      console.log('fnName', fnName);
      memo.push(entity[fnName](value));
    }
    return memo;
  }, []);
  return Promise.all(taskArray);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getInclude(req, Model) {
  try {
    var include = req.cm.param('_include');
    if (Array.isArray(include)) {
      throw new Error('include is not an array');
    }
    return include.map(function(name) {
      return {
        association: Model.associations[name]
      };
    });
  } catch (err) {
    return;
  }
}

function getOrder(req) {
  var defaultSortDir = 'DESC';
  var order;
  var sortField = req.cm.param('_sortField');
  var sortDir = req.cm.param('_sortDir') || defaultSortDir;
  if (sortField) {
    order = [
      [sortField, sortDir]
    ];
  }
  return order;
}

function getWhere(req) {
  var filters = req.cm.param('_filters') || '{}';
  // filter
  var where = JSON.parse(filters);
  var appId = req.cm.appId();
  where.applicationId = appId;
  return where;
}

function getLimit(req) {
  var defaultPageSize = 30;
  var perPage = req.cm.param('_perPage') || defaultPageSize;
  return perPage;
}

function getOffset(req) {
  var limit = getLimit(req);
  var page = req.cm.param('_page') || 1;
  var offset = (page - 1) * limit;
  return offset;
}

module.exports = resourceControllerFactory;
