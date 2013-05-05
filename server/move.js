var AWS = require('aws-sdk');
var dateFormat = require('dateformat');
require('date-utils');

if (process.env.AWS_SECRET_ACCESS_KEY === undefined ||
process.env.AWS_ACCESS_KEY_ID === undefined) {
  console.log('Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY env variables');
  return;
}

process.chdir(__dirname);

AWS.config.update({region: 'us-east-1'});
var sourceBucket = 'sfsbucket';
var destBucket = 'sfsfixed';

var s3 = new AWS.S3();
var params = {};
params = {'Bucket': sourceBucket};
s3.client.listObjects(params, function(err, data) {
  if (err) {
    console.log('error listing objects');
    console.log(err);
  } else {
    if (data.Contents.length > 0) {
      for (var i = 0; i < data.Contents.length; i++) {
        (function() {
          var key = data.Contents[i];
          var ld = new Date(dateFormat(key.LastModified));
          var now = new Date();
          if (Math.abs(now.getDaysBetween(ld)) > 3) {
            var re = /\/thumb_/;
            if (!key.Key.match(re)) {
              s3.client.copyObject({'Bucket': destBucket, 'CopySource':
                sourceBucket + '/' + encodeURIComponent(key.Key), 'Key': key.Key},
                function(err, data) {
                  if (err) {
                    console.log('error copying key ' + key.Key +
                    ' to private bucket');
                    console.log(err);
                  } else {
                    console.log('copied key ' + key.Key + ' to private buckey');
                    s3.client.deleteObject({'Bucket': sourceBucket, 'Key': key.Key},
                      function(err, data) {
                        if (err) {
                          console.log('error deleting key ' + key.Key);
                          console.log(err);
                        } else {
                          console.log('deleted key ' + key.Key);
                          console.log(data);
                        }
                      });
                  }
                });
            } else {
              if (parseInt(key.Size) > 1048576) {
                s3.client.deleteObject({'Bucket': sourceBucket, 'Key': key.Key},
                function(err, data) {
                  if (err) {
                    console.log('error deleting large thumb key ' + key.Key +
                    ' size ' + key.Size);
                    console.log(err);
                  } else {
                    console.log('deleted large thumb key ' + key.Key +
                    ' size ' + key.Size);
                    console.log(data);
                  }
                });
              }
            }
          }
        })();
      }
    }
  }
});

