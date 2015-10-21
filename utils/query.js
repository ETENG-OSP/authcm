function getInclude(req, Model) {
  try {
    var include = req.cm.param('_include');
    if (!Array.isArray(include)) {
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

exports.getInclude = getInclude;
exports.getOrder = getOrder;
exports.getWhere = getWhere;
exports.getLimit = getLimit;
exports.getOffset = getOffset;
