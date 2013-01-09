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
AWSFiles.upload = function()
{
	 for(var i =  0; i < AWSFiles.files.length ; i++)
	 {
		var file = AWSFiles.files[i].file;
		var el = AWSFiles.files[i].elem;

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
			img.onload = function()
			{
				alert('entered');
				var minImageData =  resizeImage(img,0.5,file.type);
				 
				//decode the base64 binary into am ArrayBuffer 
			    var separator = 'base64,';  
				var index = minImageData.indexOf(separator);  
				if (index != -1) {  
	
					var barray = Base64Binary.decodeArrayBuffer(minImageData.substring(index+separator.length)); 
					var dv = new DataView(barray);
					var blob = new Blob([dv],{type:file.type}); 

					var fd2 = new FormData();
					fd2.append("key",folderName + "/${filename}");
					fd2.append("acl","public-read");
					fd2.append("Content-Type",file.type);
					fd2.append('file', blob, "thumb_"+file.name);
					
					var xhr = new XMLHttpRequest();
					xhr.open("POST", url, true);
					xhr.send(fd2);
				}
	  
			sendForm(fd,AWSFiles.files[i].elem,url);
		}
	  }
}



AWSFiles.Init = function()
{
	AWSFiles.files = [];
	AWSFiles.bucketName = null;
}

AWSFiles.readyToUpload = function()
{
	return AWSFiles.bucketName != null;
}

AWSFiles.addFile = function(f,elem){
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
  
  
  function resizeImage(img,ratio,type)
  {
	 var canvas = document.createElement('canvas');
     var context = canvas.getContext('2d');
	 canvas.width = img.width * ratio;
     canvas.height = img.height * ratio;
	 context.drawImage(img, 0, 0, img.width * ratio, img.height * ratio);
	 return canvas.toDataURL(type);
  }
		
  function preview(file,i)
  {
	var el, img, progress, reader;
	var usePrevRow   = (i % 3);
	var	previewRowNum  = Math.floor(i/3);
	reader = new FileReader();
	if(usePrevRow == 0 )
	{
		$("#previewTable").append('<tr id="previewRow'+previewRowNum+'"></tr>');
	}
	el = $(	'<td>'+
				'<div class="thumbnail">' +
						'<img class="img-rounded">' +
					'<div class="caption">'+
						'<p>' + file.name + '</p>'+
						'<div class="progress progress-striped" visibility: hidden>'+
							'<div class="bar" style="width: 0%;">'+
							'</div>'+
						'</div>'+
					'</div>'+
				'</div>'+
			'</td>');
	$("#previewRow"+previewRowNum).append(el);
	
	var img = $("img", el);
	reader.onload = function(e) {

	  qrcode.decode(e.target.result);
	  img.attr('src', e.target.result);
	};
	reader.readAsDataURL(file);
	return el;
  }
  
  function handleFiles(files)
  {
	AWSFiles.Init();
	
	var file,elem;
	$("#previewTable").children().remove();
	for(var i=0; i < files.length ; i++)
	{
		file = files[i];
		if (!file.type.match('image.*')) {
			alert(file.name + ' is not an image!');
			continue;
		}
		
		elem = preview(file,i);
		AWSFiles.addFile(file,elem);
	}
  }
	  
  function handleFileSelect(files)
  {
	qrcode.callback = QRcallback;
	handleFiles(files);
  }
	  
  function handleFileupload()
  {
	AWSFiles.upload();
  }
	  
  
function sendForm(form,el,url)
{
	var xhr = new XMLHttpRequest();
			
	$(".progress", el).show();
	xhr.upload.addEventListener("progress", (function(e) {
	  return displayUploadProgress(el, e);
	}), false);
	
	xhr.addEventListener("load", function(e) {
		if(xhr.readyState == 4 )
		{
		  if (xhr.status === 204) {
			$(".progress", el).removeClass("active").addClass("progress-success");
			$(".progress", el).hide();
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
	
	
