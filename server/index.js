var util = require('util');
var http = require('http');
var router = require('router');
var route = router();
var uuid = require('node-uuid');
var static = require('node-static');
var AWS = require('aws-sdk');

if (process.env.AWS_SECRET_ACCESS_KEY === undefined ||
    process.env.AWS_ACCESS_KEY_ID === undefined) {
  console.log('Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY env variables');
  return;
}

AWS.config.update({region: 'us-east-1'});

var sfsBucket = process.env.SFSBUCKET;
var port = (process.env.SFSPORT === undefined) ? 80 : process.env.SFSPORT;

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
    try {
      params = JSON.parse(data);
    } catch (e) {
      res.writeHead(400);
      res.end('bad json');
      return;
    }
    if (params.Prefix === undefined || params.Prefix === ''||
        params.Prefix.charAt(params.Prefix.length - 1) !== '/') {
      res.writeHead(400);
      res.end('will not list');
      return;
    }
    params.Bucket = sfsBucket;
    var s3 = new AWS.S3();
    s3.client.listObjects(params, function(err, data) {
      if (err) {
        res.writeHead(400);
        res.end('aws error');
        return;
      }
      res.writeHead(200, {'content-type': 'text/json'});
      res.write(JSON.stringify(data));
      res.end();
    });
  });
});

http.createServer(route).listen(port);
