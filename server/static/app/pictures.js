/* Bind Functions */
$('#upload_pics').bind('dragenter', handleDragEnter);
$('#upload_pics').bind('dragover', handleDragOver);
$('#upload_pics').bind('drop', handleFileDrop);
$('#upload_button').bind('click', handleFileupload);
$('#close_modal').bind('click', function(){$('#upload_pics').hide()});
$('#upload_pics').draggable();
/**************************************************/

/* AWS Files Struct*/
AWSFiles = {};
AWSFiles.filesToUpload = [];
AWSFiles.filesToDownload = [];
AWSFiles.filesToDownloadIndex = 0;
AWSFiles.bucketName = 'sfsbucket';
AWSFiles.folderName = null;
AWSFiles.upload = function() {
  for(var i =  0; i < AWSFiles.filesToUpload.length ; i++) {
    var file = AWSFiles.filesToUpload[i].file;
    var el = AWSFiles.filesToUpload[i].elem;
    if(!AWSFiles.filesToUpload[i].upload) {
      continue;
    }
    var url = "https://"+this.bucketName+".s3.amazonaws.com/"
    var fd = new FormData();
    fd.append("key",this.folderName + "/${filename}");
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
          fd2.append("key",AWSFiles.folderName + "/${filename}");
          fd2.append("acl","public-read");
          fd2.append("Content-Type",f.type);
          fd2.append('file', blob, "thumb_"+f.name);
          var xhr = new XMLHttpRequest();
          xhr.open("POST", url, true);
          xhr.send(fd2);
        }
      }
	  })(file,image);
    sendForm(fd,this.filesToUpload[i],url,this.bucketName,this.folderName);
  }
}

AWSFiles.Init = function(decodedQR) {
  this.filesToUpload = [];
  this.filesToDownload = [];  
  this.folderName = decodedQR;
  this.filesToDownloadIndex = 0;
}

AWSFiles.readyToUpload = function() {
  return this.bucketName != null;
}

AWSFiles.addFileToUpload = function(f, elem) {
  var awsFile = new AWSFile(f, elem, true);
  this.filesToUpload.push(awsFile);
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
  var el = $('<li class="span2 rel">' +
             ' <a href="#" class="thumbnail" id="placeholder">' +
             ' </a>' +
             '  <div class="progress" style="display: none;">' +
             '    <div class="bar"></div>' +
             '  </div>' +
//           '  <div class="btn-toolbar" style="display: none;">' +
//           '    <div class="btn-group">' +
             '      <a class="btn remove" href="#" style="display: none;">' +
             '        <i class="icon-remove"></i>' +
             '      </a>' +
//           '      <a class="btn resize" href="#">' +
//           '        <i class="icon-resize-full"></i>' +
//           '      </a>' +
//           '    </div>' +
//           '  </div>' +
             '</li>');
  return el;
}

function preview(f) {
  var el, img;
  el = $( '<a href="#" class="thumbnail">' +
          '  <img />' +
          '</a>');
  var img = $( "img", el );
  $( '#placeholder', f.elem ).remove();
  $( f.elem ).prepend(el);
  $(f.elem).hover(function() {
    $( ".remove", f.elem ).fadeIn('slow');
  }, function()	{
    $( ".remove", f.elem ).fadeOut('slow');
  });
  $(".remove", f.elem).click(function() {
    $(f.elem).slideUp();
    $(f.elem).remove();
    f.upload = false;
  });
  $(".resize",f.elem).click(function() {
    //do something
  });
  var src = window.URL.createObjectURL(f.file);
  img.load(function() {
    img.exifLoad(function() {
      f.exif = img.exifAll();
      switch(f.exif[0].Orientation) {
        case 2:
          el.css('transform', 'scaleX(-1)');
          break;
        case 3:
          el.css('transform', 'rotate(180deg)');
          break;
        case 4:
          el.css('transform', 'scaleY(-1)');
          break;
        case 5:
          el.css('transform', 'rotate(90deg) scaleY(-1)');
          break;
        case 6:
          el.css('transform', 'rotate(90deg)');
          break;
        case 7:
          el.css('transform', 'rotate(-90deg) scaleY(-1)');
          break;
        case 8:
          el.css('transform', 'rotate(-90deg)');
          break;
      };
    });
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

function AWSFile(file ,elem ,upload, exif) {
  this.file = file;
  this.elem = elem;
  this.upload = upload;
  this.exif = exif;
}

function handleFiles(files) {  
  $( "#previewUploadImages" ).children().remove();
  $( "#upload_button" ).show();
  $( "#previewUploadImages" ).append('<ul class="thumbnails"></ul>');
  for(var i = 0; i < files.length ; i++) {
    var file = files[i];
    if (!file.type.match('image.*')) {
      continue;
    }
    var elem = createPicPlaceHolder();
    $( "#previewUploadImages>ul" ).append(elem);
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
  $( "#upload_button" ).hide();
  AWSFiles.upload();
}


function sendForm(form ,AWSfile ,url,bucketName,folderName) {
  var xhr = new XMLHttpRequest();
  var el = AWSfile.elem;

  $(".progress", el).show();
  xhr.upload.addEventListener("progress", (function(e) {
    return displayUploadProgress(el, e);
  }), false);

  xhr.addEventListener("load", function(e) {
    if(xhr.readyState === 4 ) {
      if(xhr.status === 204) {
        el.unbind('click');
        el.unbind('hover');
        $( '.progress', el ).remove();
        $( '.btn', el ).remove();
        $( 'img', el ).wrap('<a href="https://' + bucketName +
          '.s3.amazonaws.com/' + folderName + '/' + AWSfile.file.name +
          '" target="_blank"></a>');
        $('#previewDownloadImages').prepend(el);
        if ($('#previewUploadImages>ul').is(':empty')) {
          $('#upload_pics').hide();
        }
      } else {
      }
    }
  },false);

  xhr.open("POST", url, true);
  xhr.send(form);
}

/************************************ Download Functions ****************************************************/

function addImageThumbnail(fileName, complete) {
  var re = /\/thumb_/;
  var thumbrul, fullurl;
  thumburl = "https://" + AWSFiles.bucketName + ".s3.amazonaws.com/" + fileName;
  if (complete) {
    fullurl = "https://" + AWSFiles.bucketName + ".s3.amazonaws.com/" +
              fileName.replace('thumb_', '');
  } else {
    fullurl = window.location.href + '?oldfile=/' +
              fileName.replace('thumb_', '');
  }
  var link = document.createElement('a');
  var img = new Image();
  link.className = 'thumbnail';
  link.href = fullurl;
  link.target = '_blank';
  img.onload = function() {
    var e = AWSFiles.filesToDownload[AWSFiles.filesToDownloadIndex++];
    e.empty();
    e.prepend(link);
  }
  link.appendChild(img);
  img.src = thumburl;
}

function downloadFiles(objects) {

  var re = /\/thumb_/;
  $("#previewDownloadImages").children().remove();
  if(objects) {
    var thumbsArray = objects.filter(function(el) {
      return re.test(el.Key);
    });
    $(thumbsArray).each(function() {  
      elem = createPicPlaceHolder();
      $('#previewDownloadImages').append(elem);
      AWSFiles.addFileToDownload(elem);
    });
    Holder.add_image("holder.js/140x140/text:-", ".thumbnail").run()
    $(thumbsArray).each(function() { 
      for (var i = 0; i < objects.length; i++) {
        if (objects[i].Key === this.Key.replace(re, '\/')) {
          this['myComplete'] = true;
        }
      }
      addImageThumbnail(this.Key, this.myComplete);
    });
  }
}

function getFilesList(params, ret, func) {

  var url = window.location.origin + '/list';

  // send the collected data as JSON
  $.post(url, JSON.stringify(params), function(data) {
    if (data.IsTruncated) {
      ret = ret.concat(data.Contents);
      params['Marker'] = data.Contents[data.Contents.length - 1].Key;
      getFilesList(params, ret, func);
    } else {
      func(ret.concat(data.Contents));
    }
  }, 'json').fail(function() {
    func([]);
  });
}

AWSFiles.getPictures = function() {
  var arr = [];
  var params = {'Prefix': this.folderName + '/'};
  getFilesList(params, arr, downloadFiles);
}

function picturesInit(folder) {
  AWSFiles.Init(folder);
  AWSFiles.getPictures();
  pageTurn($( "#pictures" ));
  
  history.pushState({ page: 3 ,bucketData: folder});
}

