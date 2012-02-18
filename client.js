var sfu = function() {
  var ZXING_MAXFILESIZE_DECODE = 2000000;
/*  var findqr(data, theFile) {
    console.log('find qr for ' + theFile.name);
    if (theFile.size > ZXING_MAXFILESIZE_DECODE) {
      console.log('calling newImage with resize for ' + theFile.name);
      newImage(data, theFile, resizeImage);
    } else {
      console.log('calling newImage with send for ' + theFile.name);
      newImage(data, theFile, sendImage);
    }
  };
  var sendImage(image, theFile, cb) {
    var fd = new FormData();
    fd.append("full", "true");
    fd.append("f", theFile);
    var xhr = new XMLHttpRequest();
    xhr.open  
  };
  var resizeImage = function(image, theFile) {
    console.log('resize image ' + theFile.name);
    var ratio = 0.33;
    var canvas = document.createElement('canvas');
    canvas.id = theFile.name;
    document.getElementById('after').insertBefore(canvas);
    var context = canvas.getContext('2d');
    canvas.width = image.width * ratio;
    canvas.height = image.height * ratio;
    context.drawImage(image, 0, 0, image.width * ratio, image.height * ratio);
  };
  var newImage = function(data, theFile, cb) {
    console.log('new image ' + theFile.name);
    var image = new Image();
    image.onload = function() {
      cb(image, theFile);
    }
    image.src = data;
  };
 */ 
  return {
    handleFileSelect: function(e) {
                        var files = e.target.files;
                        var i = 0;
                        var f;
                        for (i = 0; f = files[i]; i = i + 1) {
                          if (!f.type.match('image.*')) {
                            continue;
                          };
                          var reader = new FileReader();
                          reader.onload = (function(theFile) {
                            return function(e) {
                              console.log('reader onload ' + theFile.name);
                              if (theFile.size > ZXING_MAXFILESIZE_DECODE) {
                                console.log('resize image ' + theFile.name);
                              } else {
                               console.log('no need to resize ' +
                                theFile.name); 
                               var fd = new FormData();
                               fd.append('f', theFile);
                               var xhr = new XMLHttpRequest();
                               xhr.open('POST',
                                 'http://zxing.org/w/decode.jspx', true);
                               xhr.setRequestHeader("Access-Control-Allow-Origin",
                                 "*");
                               xhr.onload = function(e) {
                                 if (xhr.status == 200) {
                                   console.log('uploaded');
                                 } else {
                                   console.log('error uploading');
                                 };
                               };
                               xhr.send(fd);
                              };
                            };
                          })(f);
                          reader.readAsDataURL(f);
                        };
                      }
  };
}();
