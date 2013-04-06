var util = require('util');
var http = require('http');
var router = require('router');
var route = router();
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
        params.Prefix.indexOf('/') == -1) {
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

var file = new(static.Server)('./static/app');
route.get(function(req, res) {
  file.serve(req, res);
});

http.createServer(route).listen(port);

