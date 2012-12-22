
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
			var url = "https://"+this.bucketName+".s3.amazonaws.com/"
			var fd = new FormData();
			fd.append("key","amit/${filename}");
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
	
	