var util = require('util');
var http = require('http');
var router = require('router');
var route = router();
var uuid = require('node-uuid');
var static = require('node-static');

var sfsBucket=process.env.sfsBucket;

process.chdir(__dirname);

route.get('/', function(req, res) {
  res.writeHead(200);
  res.end('hello index page');
});

var file = new(static.Server)('./static');
route.get('/app/*', function(req, res) {
  file.serve(req, res);
});

route.get('/event', function(req, res) {
  var eventName = uuid.v4();
  res.writeHead(200);
  res.end(sfsBucket + ':' + eventName);
});

http.createServer(route).listen(80);
