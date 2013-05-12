var util = require('util');
var http = require('http');
var router = require('router');
var route = router();
var static = require('node-static');
var AWS = require('aws-sdk');
var uuid = require('node-uuid');
var crypto = require('crypto');

if (process.env.AWS_SECRET_ACCESS_KEY === undefined ||
    process.env.AWS_ACCESS_KEY_ID === undefined) {
  console.log('Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY env variables');
  return;
}

AWS.config.update({region: 'us-east-1'});

var sfsBucket = process.env.SFSBUCKET;
var sfsDest = process.env.SFS_DEST_BUCKET;
var port = (process.env.SFSPORT === undefined) ? 80 : process.env.SFSPORT;
var aws_secret_access_key = process.env.AWS_SECRET_ACCESS_KEY;
var aws_access_key_id = process.env.AWS_ACCESS_KEY_ID;
var sfs_table = process.env.SFSTABLE;

process.chdir(__dirname);

var signURL = function(path) {
  var expireInSeconds = 24 * 60 *60;
  var fileName = path.substr(path.lastIndexOf('/') + 1);
  var dateObj = new Date;
  var now = dateObj.getTime();
  var expiry = parseInt(now / 1000) + expireInSeconds;
  var string = ('GET\n\n\n' +
                expiry + '\n' +
                encodeURI(path)
               );
  var sig = encodeURIComponent(crypto.createHmac('sha1',
      aws_secret_access_key).update(string).digest('base64'));
  var url = 'http://s3.amazonaws.com' + encodeURI(path) +
            '?Expires=' + expiry + 
            '&AWSAccessKeyId=' + aws_access_key_id +
            '&Signature=' + sig;
  return url;
}

var insertCredits = function(res) {
  //TODO - what happens if a put fails.
  var dynamodb = new AWS.DynamoDB();
  var credits = [];
  var ncredits = 3;
  for (var i = 0; i < ncredits; i++) {
    (function() {
      var credit = uuid.v4();
      dynamodb.putItem({'TableName': sfs_table,
        'Item': {
          'credit': {
            'S': credit}}},
            function (err, data) {
              if (err) {
                console.log(err);
              } else {
                credits.push(credit);
                if (credits.length === ncredits) {
                  res.writeHead(200, {'content-type': 'text/json'});
                  res.write(JSON.stringify(credits));
                  res.end();
                }
              }
            });
    })();
  }
}

var getUrl = function (object, credit, res) {
  var dynamodb = new AWS.DynamoDB();
  var error = null;
  var url = null;
  dynamodb.deleteItem({'TableName': sfs_table,
    'Key': {
      'credit': {
        'S': credit}},
    'Expected': {
      'credit': {
        'Exists': true,
        'Value': {
          'S': credit}}}}, function(err, data){
          if (err) {
            console.log(err);
            res.writeHead(400);
            res.end('bad credit');
          } else {
            url = signURL(object);
            res.writeHead(200, {'content-type': 'text/json'});
            res.write(JSON.stringify({'link': url}));
            res.end();
          }
        });
}

route.get('/credits', function(req, res) {
  insertCredits(res);
});

route.post('/link', function(req, res) {
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
    if (params.link && params.credit) {
      var object = '/' + sfsDest + params.link;
      var reuuidv4 =
      /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
      if (!reuuidv4.test(params.credit)) {
        res.writeHead(400);
        res.end('bad credit');
        return;
      }
      getUrl(object, params.credit, res);
    }
  });
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

