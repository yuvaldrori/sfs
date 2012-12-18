var util = require('util');
var http = require('http');
var router = require('router');
var route = router();
var uuid = require('node-uuid');
var static = require('node-static');
var AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-1'});

var sfsBucket=process.env.sfsBucket;

process.chdir(__dirname);

route.get('/', function(req, res) {
  res.writeHead(200);
  res.end('sfs');
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

route.post('/list', function(req, res) {

  var data = '';
  req.addListener('data', function(chunk) { data += chunk; });
  req.addListener('end', function() {
    params = JSON.parse(data);
    if (params.Prefix === undefined || params.Prefix === '') {
      res.writeHead(400);
      res.end('will not list root');
      return;
    }
    params.Bucket = sfsBucket;
    var s3 = new AWS.S3();
    s3.client.listObjects(params, function(err, data) {
      console.log('2222');
      if (err) {
        res.writeHead(400);
        res.end('aws error');
        return;
      }
      res.writeHead(200);
      res.end(util.inspect(data, true, null));
    });
  });
});

http.createServer(route).listen(80);
