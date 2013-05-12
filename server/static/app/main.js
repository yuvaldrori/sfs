$( document ).ready( function() {

  var url = window.location.href;
  var old_file = url.substr(url.lastIndexOf('?'));
  if ( old_file && /^\?oldfile=/.test(old_file)) {
    var old_object = old_file.split('=', 2)[1];
    pageTurn($( "#old_page" ));
    $( "#mine" ).click(function() {
      mine();
    });
    $( "#submit_credit" ).click(function() {
      getLink(old_object);
    });
  } else {
    history.pushState({ page: 1 });
    
    pageTurn($( "#welcome_page" ));
    $( "#gencode_button" ).click(function() {
      genQR();
    });
    
    $( "#picture_button" ).click(function() {
      history.pushState({ page: 2 });
        pageTurn($( "#decode_qr_page" ));
      $( "#magic_picture" ).change(decodeMagicPicture);
    });
  }
});

function getLink(old_object) {
  var url = window.location.origin + '/link';
  pdata = {'link': old_object, 'credit': $('#credit').val()};
  $.post(url, JSON.stringify(pdata), function(data) {
    if (data && data.link) {
      window.location.href = data.link;
    }
  }, 'json').fail(function() {
      $('#old_form').append('<div class="alert">' +
                            '<button type="button" class="close"' +
                            'data-dismiss="alert">&times;</button>' +
                            '<strong>Warning!</strong> Bad credit </div>');
  });
}

function mine() {
  var url = window.location.origin + '/credits';
  var lis = [];
  var ret;
  $.getJSON(url, function(data) {
    if (data.length > 0) {
      for (var i = 0; i < data.length; i++) {
        lis.push('<dd>' + data[i]  + '</dd>');
      }
      $('#no_credits').remove();
      $('#old_text').append('<dl><dt>Credits</dt>' + lis.join('') + '</dl>');
    } else {
      $('#no_credits').html('<p>Could not get credits</p>');
    }
  });
}

function pageTurn(page) {
  $( ".page" ).hide();
  $( page ).show();
}

function genFolderName(digits) {
  var power = Math.pow(36,digits);
  return Math.floor(Math.random()*power).toString(36);
}  

function genQR() {
  var qrTypeNumber = 4;
  var qrErrorCorrectionLevel = 'M';
  var size = Math.min($(window).width(), $(window).height()) * 0.9;
  // cell size calc taken from genqr code
  var qrCellSize = Math.floor(size / (qrTypeNumber * 4 + 25));
  var qr = genQRcode(qrTypeNumber,qrErrorCorrectionLevel);
  if(qr != null) {
    d = new Date();
    r = genFolderName(8);
    sday = ("0" + d.getDate()).slice(-2);
    smonth = ("0" + (d.getMonth() + 1)).slice(-2);
    syear = d.getFullYear().toString();
    text = sday + smonth + syear + r;
    qr.addData(text);
    qr.make();
    var img = qr.createImgTag(qrCellSize);
    $( "#ddmm" ).text(text.slice(0, 4));
    $( "#yyyy" ).text(text.slice(4, 8));
    $( "#1st4" ).text(text.slice(8, 12));
    $( "#2nd4" ).text(text.slice(12, 16));
    if(img != null) {
      $( "#qr_code" ).append(img);
      $( "#website" ).html('<h1 class="text-center">Goto: ' +
          window.location.origin + '</h1>');
      pageTurn($( "#new_event_page" ));
      history.pushState({ page: 4 });
    }
  }
}

function isFolder(JSONresponse) {
  var listObjects = JSON.parse(JSONresponse);
  if(listObjects.Contents.length < 1) {
    $( "#manual_tip" ).prepend('<p class="text-warning">No folder with this name exists, you might be the first to upload pictures. Just in case, please compare the typed code with the picture.</p>');
  }
  $( "#submit_code_manually" ).removeAttr('disabled');
}

function validateManualCode() {
  var d = new Date();
  var ddmm = $( "#input_ddmm" ).val();
  var lddmm = ddmm.length;
  var dd = ddmm.slice(0, 2);
  var mm = ddmm.slice(2, 4);
  var yyyy = $( "#input_yyyy" ).val()
  var lyyyy = yyyy.length;
  var fst4 = $( "#input_1st4" ).val().toLowerCase();
  var l1st4 = fst4.length;
  var snd4 = $( "#input_2nd4" ).val().toLowerCase();
  var l2nd4 = snd4.length;
  var ddmm_ok = false;
  var yyyy_ok = false;
  var fst4_ok = false;
  var snd4_ok = false;

  if(lddmm === 4) {
    if(isNaN(ddmm)) {
      $( "#label_ddmm" ).text('expected numbers');
    } else {
      $( "#label_ddmm" ).text('');
      ddmm_ok = true;
    }
  }
  if(lyyyy === 4) {
    if(isNaN(yyyy)) {
      $( "#label_yyyy" ).text('expected numbers');
    } else {
      $( "#label_yyyy" ).text('');
      yyyy_ok = true;
    }
  }
  if(ddmm_ok === true && yyyy_ok === true) {
    var fd = new Date(yyyy, mm - 1, dd);
    var message = '';
    diff = Math.abs(Math.round((d - fd)/1000/60/60/24));
    if(diff > 14) {
      $( "#manual_tip" ).empty();
      $( "#manual_tip" ).append('<p class="text-warning">Check red and blue.</p>');
      if(dd < 1 || dd > 31) {
        $( "#manual_tip" ).append('<p class="text-warning">Check first two red characters.</p>');
      }
      if(mm < 1 || dd > 12) {
        $( "#manual_tip" ).append('<p class="text-warning">Check first two red characters.</p>');
      }
      if(yyyy != d.getFullYear()) {
        $( "#manual_tip" ).append('<p class="text-warning">Check blue characters.</p>');
      }
    }
  }
  if(l1st4 === 4) {
    if(!/[0-9a-z]{4}/.test(fst4)) {
      $( "#label_1st4" ).text('expected letters or numbers');
    } else {
      $( "#label_1st4" ).text('');
      fst4_ok = true;
    }
  }
  if(l2nd4 === 4) {
    if(!/[0-9a-z]{4}/.test(snd4)) {
      $( "#label_2nd4" ).text('expected letters or numbers');
    } else {
      $( "#label_2nd4" ).text('');
      snd4_ok = true;
    }
  }
  if(ddmm_ok === true && yyyy_ok === true && fst4_ok === true &&
      snd4_ok === true) {
    //TODO: what to do when xhr fails?
    getFilesList(AWSFiles.bucketName, ddmm + yyyy + fst4 + snd4, isFolder);
  } else {
    $( "#submit_code_manually" ).attr('disabled', 'disabled');
  }
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
          window.URL.revokeObjectURL(src);
        });
        $( "#bad_qr_image" ).attr('src', src);
        $( "#bad_qr_manual" ).hide();
        pageTurn($( "#crop_qr_page" ));
        history.pushState({ page: 5 });
        $( "#crop_button" ).click(function() {
          c = jcrop_api.tellSelect();
          var canvas = document.createElement('canvas');
          canvas.width = c.w;
          canvas.height = c.h;
          var context = canvas.getContext('2d');
          context.drawImage($( "#bad_qr_image" )[0], c.x, c.y, c.w, c.h, 0, 0,
            c.w, c.h);
          qrcode.callback = function(e, d) {
            if (e) {
              $( "#input_ddmm" ).bind('change keyup', validateManualCode);
              $( "#input_yyyy" ).bind('change keyup', validateManualCode);
              $( "#input_1st4" ).bind('change keyup', validateManualCode);
              $( "#input_2nd4" ).bind('change keyup', validateManualCode);
              $( "#submit_code_manually" ).click(function() {
                var ddmm = $( "#input_ddmm" ).val();
                var yyyy = $( "#input_yyyy" ).val();
                var f4 = $( "#input_1st4" ).val().toLowerCase();
                var s4 = $( "#input_2nd4" ).val().toLowerCase();
                picturesInit(ddmm + yyyy + f4 + s4);
              });
              $( "#bad_qr_manual" ).show();
              $( "#bad_qr_status" ).html('<p class="text-error">I was not able to automatically read the QR code from the marked region. Please try again or manually type the code.</p><p class="text-warning">Please note, if the code is mistyped, you will not be able to see the pictures of other participants nor will they be able to view the pictures you upload.</p>');
            } else {
              picturesInit(d);
            };
          };
          qrcode.decode(canvas.toDataURL());
        });
      } else {
        $('#files_uploader').bind('change', handleFileSelect);
        picturesInit(d);
      };
    };
    qrcode.decode(src);
  };
}

window.onpopstate = function(event) {
	var currentState = history.state;
	if(!currentState || !currentState.page)
		return;
	switch(currentState.page)
	{
		case 1:
			pageTurn($( "#welcome_page" ));
			break;
		case 2:
			pageTurn($( "#decode_qr_page" ));
			break;
		case 3:
			picturesInit(currentState.bucketData);
			break;
		case 4:
			pageTurn($( "#new_event_page" ));
			break;
		case 5:
			pageTurn($( "#crop_qr_page" ));
			break;
		default:
	}
};


