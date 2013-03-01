$( document ).ready( function() {
  pageTurn($( "#welcome_page" ));
  $( "#gencode_button" ).click(function() {
    genQR();
  });
  $( "#picture_button" ).click(function() {
    pageTurn($( "#decode_qr_page" ));
    $( "#magic_picture" ).change(decodeMagicPicture);
  });
});

function pageTurn(page) {
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

function decodeMagicPicture() {
  if (this.files && this.files.length > 0 && this.files[0].type.match('image.*')) {
    var file = {};
    var src = window.URL.createObjectURL(this.files[0]);
    qrcode.callback = function(e, d) {
      if (e) {
        var jcrop_api;
        var size = Math.min($(window).width(), $(window).height()) * 0.9;
        $( "#bad_qr_image" ).load(function () {
          file.width = this.width;
          file.height = this.height;
          $( "#bad_qr_image" ).width(size);
          $( "#bad_qr_image" ).height(size);
          jQuery(function($) {
            $( "#bad_qr_image" ).Jcrop({
              trueSize: [file.width, file.height],
              setSelect: [file.width * 0.25,
                          file.height * 0.25,
                          file.width * 0.75,
                          file.height * 0.75]
            },
            function() {
              jcrop_api = this;
            });
          });
        });
        $( "#bad_qr_image" ).attr('src', src);
        pageTurn($( "#crop_qr_page" ));
        $( "#crop_button" ).click(function() {
          c = jcrop_api.tellSelect();
          console.log(c);
          var canvas = document.createElement('canvas');
          canvas.width = c.w;
          canvas.height = c.h;
          var context = canvas.getContext('2d');
          context.drawImage($( "#bad_qr_image" )[0], c.x, c.y, c.w, c.h, 0, 0,
            c.w, c.h);
          qrcode.callback = function(e, d) {
            if (e) {
              console.log(e);
            } else {
              console.log(d);
            };
          };
          qrcode.decode(canvas.toDataURL());
        });
      } else {
        console.log(d);
      };
    };
    qrcode.decode(src);
  };
}


