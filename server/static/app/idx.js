$(document).ready(function () {
  $("#list").hide();
  $("#fileInput").off();
  $("#fileInput").on('change', decodeqr);
});

var objURL = undefined;

var decodecb = function (e, d) {
  //window.URL.revokeObjectURL(objURL);
  if (e) {
    $("#result").text('error');
  } else {
    getFilesList(d);
  }
}

qrcode.callback = decodecb;

var decodeqr = function (e) {
  if (e.target.files) {
    objURL = window.URL.createObjectURL(e.target.files[0]);
    qrcode.decode(objURL);
  }
}

function getFilesList (decodedQR) {
  var bucketName = decodedQR.split(":")[0];
  var folderName = decodedQR.split(":")[1];
  var url = window.location.origin + '/list';
  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

  // send the collected data as JSON
  var data = {};
  data["Prefix"] = folderName + '/';
  data["Delimeter"] = "";
  xhr.send(JSON.stringify(data));
  xhr.onloadend = function () {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        downloadFiles(xhr.responseText, 'thumb_');
      }
    }
  };
}

function downloadFiles (JSONresponse, perfix) {
  var listObjects = JSON.parse(JSONresponse);
  if(listObjects.Contents && listObjects.Name) {
    // show thumbnails of existing pictures
    $(listObjects.Contents).each(function() {  
      addImageThumbnail(this.Key, listObjects.Name, perfix);
    });
  } else {
    // no pictures in dir, upload new ones
    $("#input>h1").text('Drag pictures to upload');
    $("#input>h3").text('or select them using this button:');
    $("#fileInput").off();
    $("#fileInput").on('change', selectPics);
  }
}

function addImageThumbnail (key, awsBucketName, perfix) {
  var fileName = key.split('/')[1];
  var indexOfPerfix = fileName.indexOf(perfix);
  
  //filename does not start with "thum_"
  if (indexOfPerfix != 0) return;
  
  var td = document.createElement('td');
  var name = document.createElement('b');
  //removing the perfix from the file name
  var thumbURL = 'https://' + awsBucketName + '.s3.amazonaws.com/' +
    key.replace(perfix, '');
  var origURL  = 'https://' + awsBucketName + '.s3.amazonaws.com/' + key;
  var link = document.createElement('a');
  var img = new Image(150,150);
  link.href = origURL;
  img.src = thumbURL;
  img.class = 'img-rounded';
  img.onload = function () {
    $('#downloadedPreview').append(td);
  }
  name.innerHTML = fileName.substring(perfix.length);
  //filename without perfix
  link.appendChild(img);
  td.appendChild(link);
  td.appendChild(name);
}

function selectPics (e) {
  if (e.target.files) {
    files = e.target.files;
    AWSFiles.Init();
    var file, elem;
    $("#result").children().remove();
    for(var i=0; i < files.length ; i++) {
      file = files[i];
      if (!file.type.match('image.*')) {
        continue;
      }
      console.log(file);
      elem = preview(file);
      AWSFiles.addFile(file,elem);
    }
  }
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
  el = $('<div class="thumbnail">' +
           '<img>' + '</img>' + 
           '<div class="caption">'+
             '<p>' + file.name + '</p>'+
          '</div>'+
        '</div>');
  $("#result").append(el);
  img = $("img", el);
  objurl = window.URL.createObjectURL(file);
  img.onload = function (e) {
    window.URL.revokeObjectURL(objurl);
  };
  img.src = objurl;
  return el;
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
