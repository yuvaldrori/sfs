var AWS = require('aws-sdk');
var dateFormat = require('dateformat');
require('date-utils');

if (process.env.AWS_SECRET_ACCESS_KEY === undefined ||
process.env.AWS_ACCESS_KEY_ID === undefined) {
  console.log('Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY env variables');
  return;
}

AWS.config.update({region: 'us-east-1'});
var sourceBucket = 'sfsbucket';
var destBucket = 'sfsfixed';

var s3 = new AWS.S3();
var params = {};
params = {'Bucket': sourceBucket};
s3.client.listObjects(params, function(err, data) {
  if (err) {
    console.log(err);
  } else {
    if (data.Contents.length > 0) {
      for (var i = 0; i < data.Contents.length; i++) {
        (function() {
          var key = data.Contents[i];
          var ld = new Date(dateFormat(key.LastModified));
          var now = new Date();
          if (Math.abs(now.getDaysBetween(ld)) > 7) {
            var re = /\/thumb/;
            if (!key.Key.match(re)) {
              s3.client.copyObject({'Bucket': destBucket, 'CopySource':
                sourceBucket + '/' + encodeURIComponent(key.Key), 'Key': key.Key},
                function(err, data) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log(key);
                    s3.client.deleteObject({'Bucket': sourceBucket, 'Key': key.Key},
                      function(err, data) {
                        if (err) {
                          console.log(err);
                        } else {
                          console.log(data);
                        }
                      });
                  }
                });
            }
          }
        })();
      }
    }
  }
});

