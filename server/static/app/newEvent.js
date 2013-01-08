function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
	// XHR for Chrome/Firefox/Opera/Safari.
	xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
	// XDomainRequest for IE.
	xhr = new XDomainRequest();
	xhr.open(method, url);
  } else {
	// CORS not supported.
	xhr = null;
  }
  return xhr;
}

function handleGenQR()
{
	//TODO: replace this!!
	var url = "http://localhost:80/event";
	xhr = createCORSRequest('GET', url);

	xhr.onload = function(e) {
		if(xhr.readyState == 4 )
		{
			if (xhr.status == 200) {
				  var qr = genQRcode(5,'M');
				  if(qr != null)
				  {
					qr.addData(xhr.responseText);
					qr.make();
					var img = qr.createImgTag();

					if(img != null)
					{
						$('#genQrBtn').append(img);
					}
				  }
			}
		}
	};
	xhr.send();
}