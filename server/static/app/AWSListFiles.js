 
function addImageThumbnail(key,awsBucketName,perfix)
{
	var fileName = key.split("/")[1];
	var indexOfPerfix = fileName.indexOf(perfix);
	
	//filename does not start with "thum_"
    if( indexOfPerfix != 0) return;
	
	
	var td = document.createElement('td');
	var name = document.createElement('b');                       //removing the perfix from the file name
	var thumbURL = "https://" + awsBucketName + ".s3.amazonaws.com/" + key.replace(perfix,"");
	var origURL  = "https://" + awsBucketName + ".s3.amazonaws.com/" + key;
	alert(origURL);
	var link = document.createElement('a');
	var img = new Image(150,150);
	link.href = origURL;
	img.src = thumbURL;
	img.class = "img-rounded";
	img.onload = function() {
		$('#downloadedPreview').append(td);
	}
	name.innerHTML = fileName.substring(perfix.length); //filename without perfix
	link.appendChild(img);
	td.appendChild(link);
	td.appendChild(name);
	
}

function downloadFiles(JSONresponse,perfix)
{
	
	var listObjects = JSON.parse(JSONresponse);
	if(listObjects.Contents && listObjects.Name)
	{
		$(listObjects.Contents).each(function() {  
			addImageThumbnail(this.Key,listObjects.Name,perfix);
		});
	}
}
function getFilesList(decodedQR)
{
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
      if(xhr.readyState == 4 )
	  {
		if (xhr.status == 200) {
			downloadFiles(xhr.responseText,"thumb_");
		}
	  }
						
    };
}

 function handleDownloadFiles(e)
  {
	var file = event.target.files[0];
	qrcode.callback = getFilesList;
	if (!file.type.match('image.*')) {
		alert(file.name + ' is not an image!');
	}
	var reader = new FileReader();
	reader.onload = function(e) {
	  qrcode.decode(e.target.result);
	};
	reader.readAsDataURL(file);
  }

