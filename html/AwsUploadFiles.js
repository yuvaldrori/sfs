
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

		if (file.size > (3 * 1024 * 1024)) 
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
			fd.append("Content-Type","image/jpeg'");
			fd.append('file', file);
			
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
  
  
  		
		
  function preview(file,i)
  {
	var el, img, progress, reader;
	var usePrevRow   = (i % 3);
	var	previewRowNum  = Math.floor(i/3);
	reader = new FileReader();
	if(!usePrevRow)
	{
		$("#previewTable").append('<tr class="span3" id="previewRow'+previewRowNum+'"></tr>');
	}
	el = $(	'<td>'+
				'<div class="thumbnail">' +
						'<img class="img-rounded" width="150" height="150">' +
					'<div class="caption">'+
						'<p>' + file.name + '</p>'+
						'<div class="progress progress-striped">'+
							'<div class="bar" style="width: 0%;">'+
							'</div>'+
						'</div>'+
						'<p>'+
						'</p>'+
					'</div>'+
				'</div>'+
			'</td>');
	$("#previewRow"+previewRowNum).append(el);
	img = $("img", el);
	reader.onload = function(e) {
	  qrcode.decode(e.target.result);
	  return img.attr('src', e.target.result);
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
			
	xhr.upload.addEventListener("progress", (function(e) {
	  return displayUploadProgress(el, e);
	}), false);
	
	xhr.addEventListener("load", function(e) {
		if(xhr.readyState == 4 )
		{
		  if (xhr.status === 204) {
			$(".progress", el).removeClass("active").addClass("progress-success");
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
	
	