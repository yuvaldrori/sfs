

/* Bind Functions */
$('#files_uploader').bind('change', handleFileSelect);

$('#upload_pics"').bind('dragenter', handleDragEnter);
$('#upload_pics"').bind('dragover', handleDragOver);
$('#upload_pics"').bind('drop', handleFileDrop);

$('#upload_button').bind('click', handleFileupload);

/**************************************************/

/* AWS Files Struct*/
AWSFiles = {};
AWSFiles.filesToUpload = [];
AWSFiles.filesToDownload = [];
AWSFiles.filesToDownloadIndex = 0;
AWSFiles.bucketName = null;
AWSFiles.upload = function()
{
	 for(var i =  0; i < AWSFiles.filesToUpload.length ; i++)
	 {
		var file = AWSFiles.filesToUpload[i].file;
		var el = AWSFiles.filesToUpload[i].elem;
		
		if(!AWSFiles.filesToUpload[i].upload)
		{
			continue;
		}

		if (file.size > (5 * 1024 * 1024)) //5MB
		{
		  return $(".caption p", el).text("Sorry, file's too big!");
		} 
		else 
		{
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
			}
	  
			sendForm(fd,AWSFiles.filesToUpload[i].elem,url);
		}
	  }
}



AWSFiles.Init = function(bucket)
{
	AWSFiles.filesToUpload = [];
	AWSFiles.filesToDownload = [];
	AWSFiles.bucketName = bucket;
	AWSFiles.filesToDownloadIndex = 0;
}

AWSFiles.readyToUpload = function()
{
	return AWSFiles.bucketName != null;
}

AWSFiles.addFileToUpload = function(f,elem){

	var awsFile = new AWSFile(f,elem,true);
	this.filesToUpload.push(awsFile);
	
	//cancel pic function
	$(elem).bind('click', function(el,aFile){
		$(el).remove();
		aFile.upload = false;
	}(elem,awsFile)); 
}

AWSFiles.addFileToDownload = function(elem){
	this.filesToDownload.push(elem);
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
		
		
  function createPicPlaceHolder(fileName,fileSize)
  {
	var el = $('<div class="pic_place_holder">' +
				'<div class="title">'+
					'<p>' + fileName +'('+fileSize+' kb )'+ '</p>'+
				'</div>'+
			'</div>');
	
	return el;
  }
  
  function preview(f)
  {
	var el, img, progress, reader;
	
	el = $('<div class="thumbnail">' +
				'<img class="img-rounded"/>' +
				'<div class="caption">'+
					'<div class="progress" visibility: hidden/>'+
				'<div/>'+
			'</div>');
	$(f.elem).append(el);
	
	var img = $("img", el);
	reader.onload = function(e) {
	  img.attr('src', e.target.result);
	};
	reader.readAsDataURL(f.file);
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
		
function AWSFile (file,elem,upload) {
    this.file = file;
    this.elem = elem;
	this.upload = upload;
}

function handleFiles(files)
{
	AWSFiles.Init();
	
	var file,elem;
	$("#previewUploadImages").children().remove();
	for(var i=0; i < files.length ; i++)
	{
		file = files[i];
		if (!file.type.match('image.*')) {
			continue;
		}
		
		elem = createPicPlaceHolder(file.name,file.size);
		$('#previewUploadImages').append(elem);
		AWSFiles.addFileToUpload(file,elem);
	}
	
	for(var i=0; i < AWSFiles.filesToUpload.length ; i++)
	{
		preview(AWSFiles.filesToUpload[i]);
	}
}
	  
  function handleFileSelect(event)
  {
	var files = event.target.files;
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





/************************************ Download Functions ****************************************************/

function addImageThumbnail(fileName,awsBucketName)
{
	var div = document.createElement('div');
	var name = document.createElement('b');
	var url = "https://" + awsBucketName + ".s3.amazonaws.com/" + fileName;
	var link = document.createElement('a');
	var img = new Image(150,150);
	link.href = url;
	img.src = url;
	img.class = "img-rounded";
	img.onload = function() {
		AWSFiles.filesToDownload[AWSFiles.filesToDownloadIndex++].append(div);
	}
	name.innerHTML = fileName.split("/")[1];
	link.appendChild(img);
	div.appendChild(link);
	div.appendChild(name);
	
}

function downloadFiles(JSONresponse)
{
	
	var listObjects = JSON.parse(JSONresponse);
	$("#previewDownloadImages").children().remove();
	if(listObjects.Contents && listObjects.Name)
	{
		$(listObjects.Contents).each(function() {  
			var fileName = this.Key;
			elem = createPicPlaceHolder(fileName,"");
			$('#previewDownloadImages').append(elem);
			AWSFiles.addFileToDownload(elem);
		
		});
		
		$(listObjects.Contents).each(function() {  
			var fileName = this.Key;
			addImageThumbnail(fileName,listObjects.Name);
		});
	}
}
function getFilesList(decodedQR)
{
	var bucketName = decodedQR.split(":")[0];
	var folderName = decodedQR.split(":")[1];
	
	//TODO: replace this url!!
	var url = "http://localhost:80/list";
	var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    // send the collected data as JSON
	var data = {};
	data["Prefix"] = folderName + '/';
	data["Delimeter"] = "";

    xhr.send(JSON.stringify(data));
    xhr.onloadend = function () {
      if(xhr.readyState == 4 )
	  {
		if (xhr.status == 200) {
			downloadFiles(xhr.responseText);
		}
	  }
						
    };
}
  
 AWSFiles.getPictures = function()
 {
	getFilesList(AWSFiles.bucketName);
 }
 
 
function picturesInit(bucket)
 {
	AWSFiles.Init(bucket);
	AWSFiles.getPictures();
	//show pics page
 }
  
	
	