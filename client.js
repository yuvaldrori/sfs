var sfu = function() {
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
  var newImage = function(data, theFile) {
    console.log('new image ' + theFile.name);
    var image = new Image();
    image.onload = function() {
      resizeImage(image, theFile);
    }
    image.src = data;
  };
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
                              newImage(e.target.result, theFile);
                            };
                          })(f);
                          reader.readAsDataURL(f);
                        };
                      }
  };
}();
