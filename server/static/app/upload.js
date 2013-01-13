function isCanvasSupported(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}

function QRcallback(bucketName) {
  AWSFiles.bucketName = bucketName;
}

$(document).ready(function(){
  if(isCanvasSupported() && window.File && window.FileReader) {
    qrcode.callback = QRcallback;
  }
  else {
    alert('Please get a better browser!');
  }
});

function handleDragEnter(e) {
  e.stopPropagation();
  e.preventDefault();
}

function handleDragOver(e) {
  e.stopPropagation();
  e.preventDefault();
}

function handleFileDrop(e) {
  e.stopPropagation();
  e.preventDefault();

  var dt = e.originalEvent.dataTransfer;
  var files = dt.files;
  handleFiles(files);
}

function AWSFile (file,elem) {
    this.file = file;
    this.elem = elem;
}

AWSFiles = {};
AWSFiles.files = [];
AWSFiles.bucketName = null;
AWSFiles.upload = function() {
  for(var i =  0; i < AWSFiles.files.length ; i++) {
    var file = AWSFiles.files[i].file;
    var el = AWSFiles.files[i].elem;
    //10MB limitation per picture
    if (file.size > (10 * 1024 * 1024)) {
      return $(".caption p", el).text("Sorry, file's too big!");
    } else {
      var bucketName = this.bucketName.split(":")[0];
      var folderName = this.bucketName.split(":")[1];
      var url = "https://"+bucketName+".s3.amazonaws.com/"
      var fd = new FormData();
      fd.append("key",folderName + "/${filename}");
      fd.append("acl","public-read");
      fd.append("Content-Type",file.type);
      fd.append('file', file);
      var img = new Image();
      img.src = $("img",el).attr('src');
      img.onload = (function(f,addr,folder,image) {
        return function() {
          var ratio = 0;
          var maxSize = 144;
          var max = 0;
          if (img.width > img.height) {
            max = img.width;
          } else if (img.height > img.width) {
            max = img.height;
          } else if (img.width === img.height) {
            max = img.width;
          }
          if (max > maxSize) {
            ratio = max / maxSize;
            var minImageData = resizeImage(image, ratio, f.type);
          } else {
            var minImageData = img;
          }
           
          //decode the base64 binary into am ArrayBuffer 
          var separator = 'base64,';  
          var index = minImageData.indexOf(separator);  
          if (index != -1) {  
            var barray = Base64Binary.decodeArrayBuffer(minImageData.substring(index+separator.length)); 
            var dv = new DataView(barray);
            var blob = new Blob([dv],{type:f.type}); 
            alert("a " + f.name);
            var fd2 = new FormData();
            fd2.append("key",folder + "/${filename}");
            fd2.append("acl","public-read");
            fd2.append("Content-Type",f.type);
            fd2.append('file', blob,"thumb_"+f.name);
            
            var xhr = new XMLHttpRequest();
            xhr.open("POST", addr, true);
            xhr.send(fd2);
          }
        }
      })(file,url,folderName,img);
    
      sendForm(fd,AWSFiles.files[i].elem,url);
    }
  }
}

AWSFiles.Init = function() {
  AWSFiles.files = [];
  AWSFiles.bucketName = null;
}

AWSFiles.readyToUpload = function() {
  return AWSFiles.bucketName != null;
}

AWSFiles.addFile = function(f,elem) {
  this.files.push(new AWSFile(f,elem));
}


function displayUploadProgress(el, event){
  var percent;
  if (event.lengthComputable) {
    percent = Math.floor((event.loaded / event.total) * 100);
    $(".progress", el).toggleClass("active", true);
    $(".bar", el).css({
      "width": "" + percent + "%"
    });
    return $(".caption p", el).text("" + percent + "% uploaded");
  }
};
  
function resizeImage(img, ratio, type) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  canvas.width = img.width * ratio;
  canvas.height = img.height * ratio;
  context.drawImage(img, 0, 0, img.width * ratio, img.height * ratio);
  return canvas.toDataURL(type);
}
    
function preview(file) {
  var el, img, reader;
  reader = new FileReader();
  el = '<p>rr</p>';
  /*
  el = $('<div class="thumbnail">' +
           '<img>' +
           '<div class="caption">'+
             '<p>' + file.name + '</p>'+
          '</div>'+
        '</div>');
  $("#grid").append(el);
  img = $("img", el);
  */ 
  reader.onload = function(e) {
    qrcode.decode(e.target.result);
    //img.attr('src', e.target.result);
  };
  reader.readAsDataURL(file);
  return el;
}
  
function handleFiles(files) {
  AWSFiles.Init();
  var file, elem;
  $("#grid").children().remove();
  for(var i=0; i < files.length ; i++) {
    file = files[i];
    if (!file.type.match('image.*')) {
      continue;
    }
      
    elem = preview(file);
    AWSFiles.addFile(file,elem);
  }
}
    
function handleFileSelect(files) {
  handleFiles(files);
}
    
function handleFileupload() {
  AWSFiles.upload();
}
  
function sendForm(form,el,url) {
  var xhr = new XMLHttpRequest();
      
  xhr.upload.addEventListener("progress", (function(e) {
    return displayUploadProgress(el, e);
  }), false);
  
  xhr.addEventListener("load", function(e) {
    if(xhr.readyState == 4 ) {
      if (xhr.status === 204) {
        return $(".caption p", el).text("Upload complete! ").append($("<a href=\"" + url + "\">View on S3</a>"));
      } else {
        return $(".caption p", el).text("Upload failed ?");
      }
    }
  },false);
  
  $(".caption p", el).text("Starting upload...");
  xhr.open("POST", url, true);
  xhr.send(form);
}

