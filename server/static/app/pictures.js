/* Bind Functions */
$('#files_uploader').bind('change', handleFileSelect);
$('#upload_pics').bind('dragenter', handleDragEnter);
$('#upload_pics').bind('dragover', handleDragOver);
$('#upload_pics').bind('drop', handleFileDrop);
$('#upload_button').bind('click', handleFileupload);
/**************************************************/

/* AWS Files Struct*/
AWSFiles = {};
AWSFiles.filesToUpload = [];
AWSFiles.filesToDownload = [];
AWSFiles.filesToDownloadIndex = 0;
AWSFiles.bucketName = null;
AWSFiles.upload = function() {
  for(var i =  0; i < AWSFiles.filesToUpload.length ; i++) {
    var file = AWSFiles.filesToUpload[i].file;
    var el = AWSFiles.filesToUpload[i].elem;

    if(!AWSFiles.filesToUpload[i].upload) {
      continue;
    }

    if (file.size > (5 * 1024 * 1024)) { //5MB
      return $(".caption p", el).text("Sorry, file's too big!");
    } 
    else {
      var bucketName = this.bucketName.split(":")[0];
      var folderName = this.bucketName.split(":")[1];
      var url = "https://"+bucketName+".s3.amazonaws.com/"
        var fd = new FormData();
      fd.append("key",folderName + "/${filename}");
      fd.append("acl","public-read");
      fd.append("Content-Type",file.type);
      fd.append('file', file);

      var image = new Image();
      image.src = $("img",el).attr('src');
	  
	  (function(f,img) {
	  
		img.onload = function() {
			var minImageData =  resizeImage(img,0.5,f.type);
			//decode the base64 binary into am ArrayBuffer 
			var separator = 'base64,';  
			var index = minImageData.indexOf(separator);
			
			if (index != -1) {  
			  var barray = Base64Binary.decodeArrayBuffer(minImageData.substring(index+separator.length)); 
			  var dv = new DataView(barray);
			  var blob = new Blob([dv],{type:f.type}); 
			  var fd2 = new FormData();
			  fd2.append("key",folderName + "/${filename}");
			  fd2.append("acl","public-read");
			  fd2.append("Content-Type",f.type);
			  fd2.append('file', blob, "thumb_"+f.name);
			  var xhr = new XMLHttpRequest();
			  xhr.open("POST", url, true);
			  xhr.send(fd2);
			}
		  }
	  })(file,image);
  
      
      }
      sendForm(fd,AWSFiles.filesToUpload[i].elem,url);
    }
}

AWSFiles.Init = function(bucket) {
  AWSFiles.filesToUpload = [];
  AWSFiles.filesToDownload = [];
  AWSFiles.bucketName = bucket;
  AWSFiles.filesToDownloadIndex = 0;
}

AWSFiles.readyToUpload = function() {
  return AWSFiles.bucketName != null;
}

AWSFiles.addFileToUpload = function(f, elem) {
  var awsFile = new AWSFile(f, elem, true);
  this.filesToUpload.push(awsFile);
  //cancel pic function
  $(elem).bind('click', function() {
    $(elem).remove();
    awsFile.upload = false;
  }); 
}

AWSFiles.addFileToDownload = function(elem){
  this.filesToDownload.push(elem);
}

function displayUploadProgress(el, event) {
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

function resizeImage(img,ratio,type) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  canvas.width = img.width * ratio;
  canvas.height = img.height * ratio;
  context.drawImage(img, 0, 0, img.width * ratio, img.height * ratio);
  return canvas.toDataURL(type);
}

function createPicPlaceHolder() {
  var el = $('<div class="pic_place_holder_empty">' +
             '</div>');
  return el;
}

function preview(f) {
  var el, img, progress;
  el = $( '<div class="thumbnail_empty">' +
           '<img class="thumb"/>' +
           '<div class="caption">' +
		     '<p/>' +
             '<div class="progress" visibility: hidden/>' +
           '<div/>' +
         '</div>' );
  var img = $( "img", el );
  $( f.elem ).append(el);
  var src = window.URL.createObjectURL(f.file);
  img.load(function() {
    f.elem.attr('class', 'pic_place_holder');
  });
  img.attr('src', src);
}

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

function AWSFile(file ,elem ,upload) {
  this.file = file;
  this.elem = elem;
  this.upload = upload;
}

function handleFiles(files) {  
  $("#previewUploadImages").children().remove();
  for(var i = 0; i < files.length ; i++) {
    var file = files[i];
    if (!file.type.match('image.*')) {
      continue;
    }
    var elem = createPicPlaceHolder();
    $( "#previewUploadImages" ).append(elem);
    AWSFiles.addFileToUpload(file, elem);
  }
  for(var i = 0; i < AWSFiles.filesToUpload.length ; i++) {
    preview(AWSFiles.filesToUpload[i]);
  }
}

function handleFileSelect(event) {
  var files = event.target.files;
  handleFiles(files);
}

function handleFileupload() {
  AWSFiles.upload();
}


function sendForm(form ,el ,url) {
  var xhr = new XMLHttpRequest();

  $(".progress", el).show();
  xhr.upload.addEventListener("progress", (function(e) {
    return displayUploadProgress(el, e);
  }), false);

  xhr.addEventListener("load", function(e) {
    if(xhr.readyState == 4 ) {
      if (xhr.status === 204) {
        $(".progress", el).removeClass("active").addClass("progress-success");
        $(".progress", el).hide();
        return $(".caption p", el).text("Upload complete! ");
      } else {
        return $(".caption p", el).text("Upload failed ?");
      }
    }
  },false);

  $(".caption p", el).text("Starting upload...");
  xhr.open("POST", url, true);
  xhr.send(form);
}





/************************************ Download Functions ****************************************************/

function addImageThumbnail(fileName, awsBucketName) {
  var div = document.createElement('div');
  var url = "https://" + awsBucketName + ".s3.amazonaws.com/" + fileName;
  var link = document.createElement('a');
  var img = new Image(140, 140);
  link.href = url;
  img.src = url;
  img.class = "thumb";
  img.onload = function() {
    var e = AWSFiles.filesToDownload[AWSFiles.filesToDownloadIndex++];
    e.append(div);
    $( e ).attr('class', 'pic_place_holder');
  }
  link.appendChild(img);
  div.appendChild(link);
}

function downloadFiles(JSONresponse) {

  var listObjects = JSON.parse(JSONresponse);
  $("#previewDownloadImages").children().remove();
  if(listObjects.Contents && listObjects.Name) {
    $(listObjects.Contents).each(function() {  
      var fileName = this.Key;
      elem = createPicPlaceHolder();
      $('#previewDownloadImages').append(elem);
      AWSFiles.addFileToDownload(elem);
    });

    $(listObjects.Contents).each(function() {  
      var fileName = this.Key;
      addImageThumbnail(fileName ,listObjects.Name);
    });
  }
}

function getFilesList(decodedQR) {
  var bucketName = decodedQR.split(":")[0];
  var folderName = decodedQR.split(":")[1];

  var url = window.location.origin + '/list';
  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

  // send the collected data as JSON
  var data = {};
  data["Prefix"] = folderName + '/';
  xhr.send(JSON.stringify(data));
  xhr.onloadend = function () {
    if(xhr.readyState == 4 ) {
      if (xhr.status == 200) {
        downloadFiles(xhr.responseText);
      }
    }
  };
}

AWSFiles.getPictures = function() {
  getFilesList(AWSFiles.bucketName);
}

function picturesInit(bucket) {
  AWSFiles.Init(bucket);
  AWSFiles.getPictures();
  pageTurn($( "#pictures" ));
}

