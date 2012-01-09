var sfu = function() {
  var smallen = function(data, theFile) {
    var image = new Image();
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var canvasCopy = document.createElement('canvas');
    var contextCopy = canvas.getContext('2d');
    image.onload = function() {
      console.log('image onload');
      canvasCopy.width = image.width;
      canvasCopy.height = image.height;
      contextCopy.drawImage(image, 0, 0);
      canvas.width = image.width * 0.25;
      canvas.height = image.height * 0.25;
      context.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height,
          0, 0, canvas.width, canvas.height);
    };
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
                              smallen(e.target.result, theFile);
                            };
                          })(f);
                          reader.readAsDataURL(f);
                        };
                      }
  };
}();
