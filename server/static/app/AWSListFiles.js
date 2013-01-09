 
function addImageThumbnail(fileName,awsBucketName)
{
	var td = document.createElement('td');
	var name = document.createElement('b');
	var url = "https://" + awsBucketName + ".s3.amazonaws.com/" + fileName;
	var link = document.createElement('a');
	var img = new Image(150,150);
	link.href = url;
	img.src = url;
	img.class = "img-rounded";
	img.onload = function() {
		$('#downloadedPreview').append(td);
	}
	name.innerHTML = fileName.split("/")[1];
	link.appendChild(img);
	td.appendChild(link);
	td.appendChild(name);
	
}

function downloadFiles(JSONresponse)
{
	
	var listObjects = JSON.parse(JSONresponse);
	if(listObjects.Contents && listObjects.Name)
	{
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
			downloadFiles(xhr.responseText);
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

