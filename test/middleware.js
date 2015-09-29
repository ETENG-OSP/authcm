var express = require('express');
var memwatch = require('memwatch-next');
var heapdump = require('heapdump');
var app = express();

// memwatch.on('leak', function(info) {
//   console.log(info);
// });

var data = [];

var myUtil = function() {
  return function(req, res, next) {
    req.test = function() {
      return req.path;
    };
    next();
  };
};


var hd;

app.use(myUtil());

app.get('/dump', function(req, res) {
  heapdump.writeSnapshot(Date.now() + '.heapsnapshot', function() {
    res.send('ok');
  });
});

app.get('/begin', function(req, res) {
  console.log('begin');
  hd = new memwatch.HeapDiff();
  res.send('ok');
});

app.get('/end', function(req, res) {
  console.log('end');
  var diff = hd.end();
  console.log(diff.before);
  console.log(diff.after);
  res.send(diff);
  diff = null;
});

app.get('/test', function(req, res) {
  // console.log('request received');
  res.send(req.test());
  // res.send('ok');
});

app.listen(3000);
console.log('startup');
