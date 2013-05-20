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

    $( "#magic_picture" ).change(decodeMagicPicture);
    
  }
});

function getLink(old_object) {
  var reuuidv4 =
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
  var badCreditMsg = '<div class="alert">' +
                     '<button type="button" class="close"' +
                     'data-dismiss="alert">&times;</button>' +
                     '<strong>Bad credit!</strong></div>';
  if (!reuuidv4.test($('#credit').val())) {
    $('#old_text').append(badCreditMsg);
    return;
  }
  var url = window.location.origin + '/link';
  pdata = {'link': old_object, 'credit': $('#credit').val()};
  $.post(url, JSON.stringify(pdata), function(data) {
    if (data && data.link) {
      window.location.href = data.link;
    }
  }, 'json').fail(function() {
      $('#old_text').append(badCreditMsg);
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
  var qrheightscale = 0.5;
  var size = Math.min($(window).width(), $(window).height()) * qrheightscale;
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
      $( "#website" ).html('<h1 class="text-center">' +
          window.location.origin + '</h1>');
      pageTurn($( "#new_event_page" ));
      history.pushState({ page: 4 });
    }
  }
}

function isFolder(objects) {
  if(objects.length < 1) {
    $('#manual_tip').show();
    $( "#manual_tip" ).html('<strong>Event not found!</strong> You might be the first from the event to upload pictures. Just in case, compare the typed code with the picture.');
  } else {
    $('#manual_tip').hide();
  }
  $( "#submit_code_manually" ).removeAttr('disabled');
}

function validateManualCode() {
  var ddmm = $( "#input_ddmm" ).val();
  var lddmm = ddmm.length;
  var yyyy = $( "#input_yyyy" ).val()
  var lyyyy = yyyy.length;
  var fst4 = $( "#input_1st4" ).val().toLowerCase();
  var l1st4 = fst4.length;
  var snd4 = $( "#input_2nd4" ).val().toLowerCase();
  var l2nd4 = snd4.length;

  if (lddmm === 4 && lyyyy === 4 && l1st4 === 4 && l2nd4 === 4) {
    var arr = [];
    var params = {'Prefix': ddmm + yyyy + fst4 + snd4 + '/'};
    getFilesList(params, arr, isFolder);
  }
}

function decodeMagicPicture() {
  if (this.files && this.files.length > 0 &&
    this.files[0].type.match('image.*')) {
      var file = {};
      var src = window.URL.createObjectURL(this.files[0]);
      qrcode.callback = function(e, d) {
      var re = /\d{8}[\da-z]{8}/;
        if (e || !re.test(d)) {
          $('#manual_code').draggable();
          $( "#bad_qr_image" ).attr('src', src);
          pageTurn($( "#bad_qr_page" ));
          history.pushState({ page: 5 });
          $( "#input_ddmm" ).bind('change keyup', validateManualCode);
          $( "#input_yyyy" ).bind('change keyup', validateManualCode);
          $( "#input_1st4" ).bind('change keyup', validateManualCode);
          $( "#input_2nd4" ).bind('change keyup', validateManualCode);
          $( "#submit_code_manually" ).click(function() {
            var ddmm = $( "#input_ddmm" ).val();
            var yyyy = $( "#input_yyyy" ).val();
            var f4 = $( "#input_1st4" ).val().toLowerCase();
            var s4 = $( "#input_2nd4" ).val().toLowerCase();
            window.URL.revokeObjectURL(src);
            picturesInit(ddmm + yyyy + f4 + s4);
          });
          $( "#bad_qr_manual" ).show();
          $( "#bad_qr_status" ).html('<p class="text-warning"><strong>Note!</strong> if the code is mistyped, you will not see pictures from other participants nor will they see the pictures you upload.</p>');
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


