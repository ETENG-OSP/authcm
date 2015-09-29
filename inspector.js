var memwatch = require('memwatch-next');
var router = require('express').Router();

var hd;

router.get('/memwatch/heapdiff/begin', function(req, res) {
  hd = new memwatch.HeapDiff();
  res.send('ok');
});

router.get('/memwatch/heapdiff/end', function(req, res) {
  var diff = hd.end();
  console.log('before:', diff.before);
  console.log('after:', diff.after);
  res.json(diff);
});

module.exports = router;
