var util = require('util');
var http = require('http');
var router = require('router');
var route = router();
var uuid = require('node-uuid');
var awssum = require('awssum');
var amazon = awssum.load('amazon/amazon');
var S3 = awssum.load('amazon/s3').S3;
var static = require('node-static');

var awsAccessKeyID=process.env.AWSAccessKeyID;
var awsAccountID=process.env.AWSAccountID;
var awsSecretAccessKey=process.env.AWSSecretAccessKey;

process.chdir(__dirname);

var threeDayRule = {
  'Prefix' : '',
  'Status' : 'Enabled',
  'Days'   : 3,
  'ID'     : '3daysRule'
}

var cors = {'CORSRule':{
  'AllowedOrigin' : '*',
  'AllowedMethod' : ['POST', 'PUT', 'GET'],
  'AllowedHeader' : '*',
  'MaxAgeSeconds' : '3000'
}}

route.get('/', function(req, res) {
  res.writeHead(200);
  res.end('hello index page');
});

var file = new(static.Server)('./static');
route.get('/app/*', function(req, res) {
  file.serve(req, res);
});

route.get('/event', function(req, res) {
  var s3 = new S3({
    'accessKeyId' : awsAccessKeyID,
    'secretAccessKey' : awsSecretAccessKey,
    'region' : amazon.US_EAST_1
  });

  s3.CreateBucket({BucketName:'sfs_' + uuid.v4(),
    Acl:'public-read-write'}, function(err, data){
      if (err) {
        res.writeHead(400);
        res.end(err.message);
        util.log(util.inspect(err, true, null));
        return;
      }
      var bucketName = data.Headers.location.slice(1);
      s3.PutBucketLifecycle({BucketName:bucketName,
        Rules:[threeDayRule]}, function(err, data) {
          if (err) {
            res.writeHead(400);
            res.end('PutBucketLifecycle error');
            util.log(util.inspect(err, true, null));
            return;
          }
          s3.PutBucketCors({BucketName:bucketName,
            CorsConfiguration:[cors]}, function(err, data) {
              if (err) {
                res.writeHead(400);
                res.end('PutBucketCors error');
                util.log(util.inspect(err, true, null));
                return;
              }
              res.writeHead(200);
              res.end(bucketName);
              util.log(util.inspect(data, true, null));
            });
        });
    });
});

http.createServer(route).listen(80);
