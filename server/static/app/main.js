$( document ).ready( function() {
  pageTurn($( "#welcome_page" ));
  $( "#gencode_button" ).click(function() {
    genQR();
  });
});

function pageTurn (page) {
  $( ".page" ).hide();
  $( page ).show();
}

function genQR() {
	var url = window.location.origin + '/event';
  var qrTypeNumber = 5;
  var qrErrorCorrectionLevel = 'M';
  var size = Math.min($(window).width(), $(window).height()) * 0.9;
  // cell size calc taken from genqr code
  var qrCellSize = Math.floor(size / (qrTypeNumber * 4 + 25));
  $.ajax(url).done(function(text) {
    var qr = genQRcode(qrTypeNumber,qrErrorCorrectionLevel);
    if(qr != null) {
      qr.addData(text);
      qr.make();
      var img = qr.createImgTag(qrCellSize);
      $( "#folder>p" ).text(text);
      if(img != null) {
        $( "#qr_code" ).append(img);
        $( "#website>p" ).text('goto: ' + window.location.origin);
        pageTurn($( "#new_event_page" ));
      }
    }
  });
}
