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
	var url = window.location.origin + '/event';
	xhr = createCORSRequest('GET', url);

  var qrTypeNumber = 5;
  var qrErrorCorrectionLevel = 'M';
  var size = Math.min($(window).width(), $(window).height()) * 0.7;
  // cell size calc taken from genqr code
  var qrCellSize = Math.floor(size / (qrTypeNumber * 4 + 25));
  

	xhr.onload = function(e) {
		if(xhr.readyState == 4 )
		{
			if (xhr.status == 200) {
        var qr = genQRcode(qrTypeNumber,qrErrorCorrectionLevel);
        if(qr != null) {
          qr.addData(xhr.responseText);
          qr.make();
          var img = qr.createImgTag(qrCellSize);
          $("#encoded").text(xhr.responseText);
          if(img != null) {
            $('#genQrBtn').append(img);
          }
  		  }
			}
		}
	};
	xhr.send();
}
