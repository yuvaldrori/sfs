function com_feller_picup_PickUp(){
  var $wnd_0 = window, $doc_0 = document, $stats = $wnd_0.__gwtStatsEvent?function(a){
    return $wnd_0.__gwtStatsEvent(a);
  }
  :null, $sessionId_0 = $wnd_0.__gwtStatsSessionId?$wnd_0.__gwtStatsSessionId:null, scriptsDone, loadDone, bodyDone, base = '', metaProps = {}, values = [], providers = [], answers = [], softPermutationId = 0, onLoadErrorFunc, propertyErrorFunc;
  $stats && $stats({moduleName:'com.feller.picup.PickUp', sessionId:$sessionId_0, subSystem:'startup', evtGroup:'bootstrap', millis:(new Date).getTime(), type:'begin'});
  if (!$wnd_0.__gwt_stylesLoaded) {
    $wnd_0.__gwt_stylesLoaded = {};
  }
  if (!$wnd_0.__gwt_scriptsLoaded) {
    $wnd_0.__gwt_scriptsLoaded = {};
  }
  function isHostedMode(){
    var result = false;
    try {
      var query = $wnd_0.location.search;
      return (query.indexOf('gwt.codesvr=') != -1 || (query.indexOf('gwt.hosted=') != -1 || $wnd_0.external && $wnd_0.external.gwtOnLoad)) && query.indexOf('gwt.hybrid') == -1;
    }
     catch (e) {
    }
    isHostedMode = function(){
      return result;
    }
    ;
    return result;
  }

  function maybeStartModule(){
    if (scriptsDone && loadDone) {
      var iframe = $doc_0.getElementById('com.feller.picup.PickUp');
      var frameWnd = iframe.contentWindow;
      if (isHostedMode()) {
        frameWnd.__gwt_getProperty = function(name_0){
          return computePropValue(name_0);
        }
        ;
      }
      com_feller_picup_PickUp = null;
      frameWnd.gwtOnLoad(onLoadErrorFunc, 'com.feller.picup.PickUp', base, softPermutationId);
      $stats && $stats({moduleName:'com.feller.picup.PickUp', sessionId:$sessionId_0, subSystem:'startup', evtGroup:'moduleStartup', millis:(new Date).getTime(), type:'end'});
    }
  }

  function computeScriptBase(){
    function getDirectoryOfFile(path){
      var hashIndex = path.lastIndexOf('#');
      if (hashIndex == -1) {
        hashIndex = path.length;
      }
      var queryIndex = path.indexOf('?');
      if (queryIndex == -1) {
        queryIndex = path.length;
      }
      var slashIndex = path.lastIndexOf('/', Math.min(queryIndex, hashIndex));
      return slashIndex >= 0?path.substring(0, slashIndex + 1):'';
    }

    function ensureAbsoluteUrl(url){
      if (url.match(/^\w+:\/\//)) {
      }
       else {
        var img = $doc_0.createElement('img');
        img.src = url + 'clear.cache.gif';
        url = getDirectoryOfFile(img.src);
      }
      return url;
    }

    function tryMetaTag(){
      var metaVal = __gwt_getMetaProperty('baseUrl');
      if (metaVal != null) {
        return metaVal;
      }
      return '';
    }

    function tryNocacheJsTag(){
      var scriptTags = $doc_0.getElementsByTagName('script');
      for (var i = 0; i < scriptTags.length; ++i) {
        if (scriptTags[i].src.indexOf('com.feller.picup.PickUp.nocache.js') != -1) {
          return getDirectoryOfFile(scriptTags[i].src);
        }
      }
      return '';
    }

    function tryMarkerScript(){
      var thisScript;
      if (typeof isBodyLoaded == 'undefined' || !isBodyLoaded()) {
        var markerId = '__gwt_marker_com.feller.picup.PickUp';
        var markerScript;
        $doc_0.write('<script id="' + markerId + '"><\/script>');
        markerScript = $doc_0.getElementById(markerId);
        thisScript = markerScript && markerScript.previousSibling;
        while (thisScript && thisScript.tagName != 'SCRIPT') {
          thisScript = thisScript.previousSibling;
        }
        if (markerScript) {
          markerScript.parentNode.removeChild(markerScript);
        }
        if (thisScript && thisScript.src) {
          return getDirectoryOfFile(thisScript.src);
        }
      }
      return '';
    }

    function tryBaseTag(){
      var baseElements = $doc_0.getElementsByTagName('base');
      if (baseElements.length > 0) {
        return baseElements[baseElements.length - 1].href;
      }
      return '';
    }

    var tempBase = tryMetaTag();
    if (tempBase == '') {
      tempBase = tryNocacheJsTag();
    }
    if (tempBase == '') {
      tempBase = tryMarkerScript();
    }
    if (tempBase == '') {
      tempBase = tryBaseTag();
    }
    if (tempBase == '') {
      tempBase = getDirectoryOfFile($doc_0.location.href);
    }
    tempBase = ensureAbsoluteUrl(tempBase);
    base = tempBase;
    return tempBase;
  }

  function processMetas(){
    var metas = document.getElementsByTagName('meta');
    for (var i = 0, n = metas.length; i < n; ++i) {
      var meta = metas[i], name_0 = meta.getAttribute('name'), content_0;
      if (name_0) {
        name_0 = name_0.replace('com.feller.picup.PickUp::', '');
        if (name_0.indexOf('::') >= 0) {
          continue;
        }
        if (name_0 == 'gwt:property') {
          content_0 = meta.getAttribute('content');
          if (content_0) {
            var value, eq = content_0.indexOf('=');
            if (eq >= 0) {
              name_0 = content_0.substring(0, eq);
              value = content_0.substring(eq + 1);
            }
             else {
              name_0 = content_0;
              value = '';
            }
            metaProps[name_0] = value;
          }
        }
         else if (name_0 == 'gwt:onPropertyErrorFn') {
          content_0 = meta.getAttribute('content');
          if (content_0) {
            try {
              propertyErrorFunc = eval(content_0);
            }
             catch (e) {
              alert('Bad handler "' + content_0 + '" for "gwt:onPropertyErrorFn"');
            }
          }
        }
         else if (name_0 == 'gwt:onLoadErrorFn') {
          content_0 = meta.getAttribute('content');
          if (content_0) {
            try {
              onLoadErrorFunc = eval(content_0);
            }
             catch (e) {
              alert('Bad handler "' + content_0 + '" for "gwt:onLoadErrorFn"');
            }
          }
        }
      }
    }
  }

  function __gwt_getMetaProperty(name_0){
    var value = metaProps[name_0];
    return value == null?null:value;
  }

  function unflattenKeylistIntoAnswers(propValArray, value){
    var answer = answers;
    for (var i = 0, n = propValArray.length - 1; i < n; ++i) {
      answer = answer[propValArray[i]] || (answer[propValArray[i]] = []);
    }
    answer[propValArray[n]] = value;
  }

  function computePropValue(propName){
    var value = providers[propName](), allowedValuesMap = values[propName];
    if (value in allowedValuesMap) {
      return value;
    }
    var allowedValuesList = [];
    for (var k in allowedValuesMap) {
      allowedValuesList[allowedValuesMap[k]] = k;
    }
    if (propertyErrorFunc) {
      propertyErrorFunc(propName, allowedValuesList, value);
    }
    throw null;
  }

  var frameInjected;
  function maybeInjectFrame(){
    if (!frameInjected) {
      frameInjected = true;
      var iframe = $doc_0.createElement('iframe');
      iframe.src = "javascript:''";
      iframe.id = 'com.feller.picup.PickUp';
      iframe.style.cssText = 'position:absolute;width:0;height:0;border:none';
      iframe.tabIndex = -1;
      $doc_0.body.appendChild(iframe);
      $stats && $stats({moduleName:'com.feller.picup.PickUp', sessionId:$sessionId_0, subSystem:'startup', evtGroup:'moduleStartup', millis:(new Date).getTime(), type:'moduleRequested'});
      iframe.contentWindow.location.replace(base + initialHtml);
    }
  }

  providers['user.agent'] = function(){
    var ua = navigator.userAgent.toLowerCase();
    var makeVersion = function(result){
      return parseInt(result[1]) * 1000 + parseInt(result[2]);
    }
    ;
    if (function(){
      return ua.indexOf('opera') != -1;
    }
    ())
      return 'opera';
    if (function(){
      return ua.indexOf('webkit') != -1 || function(){
        if (ua.indexOf('chromeframe') != -1) {
          return true;
        }
        if (typeof window['ActiveXObject'] != 'undefined') {
          try {
            var obj = new ActiveXObject('ChromeTab.ChromeFrame');
            if (obj) {
              obj.registerBhoIfNeeded();
              return true;
            }
          }
           catch (e) {
          }
        }
        return false;
      }
      ();
    }
    ())
      return 'safari';
    if (function(){
      return ua.indexOf('msie') != -1 && $doc_0.documentMode >= 9;
    }
    ())
      return 'ie9';
    if (function(){
      return ua.indexOf('msie') != -1 && $doc_0.documentMode >= 8;
    }
    ())
      return 'ie8';
    if (function(){
      var result = /msie ([0-9]+)\.([0-9]+)/.exec(ua);
      if (result && result.length == 3)
        return makeVersion(result) >= 6000;
    }
    ())
      return 'ie6';
    if (function(){
      return ua.indexOf('gecko') != -1;
    }
    ())
      return 'gecko1_8';
    return 'unknown';
  }
  ;
  values['user.agent'] = {gecko1_8:0, ie6:1, ie8:2, ie9:3, opera:4, safari:5};
  com_feller_picup_PickUp.onScriptLoad = function(){
    if (frameInjected) {
      loadDone = true;
      maybeStartModule();
    }
  }
  ;
  com_feller_picup_PickUp.onInjectionDone = function(){
    scriptsDone = true;
    $stats && $stats({moduleName:'com.feller.picup.PickUp', sessionId:$sessionId_0, subSystem:'startup', evtGroup:'loadExternalRefs', millis:(new Date).getTime(), type:'end'});
    maybeStartModule();
  }
  ;
  processMetas();
  computeScriptBase();
  var strongName;
  var initialHtml;
  if (isHostedMode()) {
    if ($wnd_0.external && ($wnd_0.external.initModule && $wnd_0.external.initModule('com.feller.picup.PickUp'))) {
      $wnd_0.location.reload();
      return;
    }
    initialHtml = 'hosted.html?com_feller_picup_PickUp';
    strongName = '';
  }
  $stats && $stats({moduleName:'com.feller.picup.PickUp', sessionId:$sessionId_0, subSystem:'startup', evtGroup:'bootstrap', millis:(new Date).getTime(), type:'selectingPermutation'});
  if (!isHostedMode()) {
    try {
      unflattenKeylistIntoAnswers(['safari'], '4403379B848D563805112DE65C48AC51');
      unflattenKeylistIntoAnswers(['opera'], '4FF17FF9E716A82031F4D04957C5C37B');
      unflattenKeylistIntoAnswers(['ie9'], '6F27C2469E1C9344773D84F9095FDDAC');
      unflattenKeylistIntoAnswers(['ie6'], '87281B486987F24C32A56F7E99F02375');
      unflattenKeylistIntoAnswers(['ie8'], 'C6CE1DE560C454B7E5C3243B694F1B14');
      unflattenKeylistIntoAnswers(['gecko1_8'], 'EE926A253E462DD1C6CC2013F8BFBCDA');
      strongName = answers[computePropValue('user.agent')];
      var idx = strongName.indexOf(':');
      if (idx != -1) {
        softPermutationId = Number(strongName.substring(idx + 1));
        strongName = strongName.substring(0, idx);
      }
      initialHtml = strongName + '.cache.html';
    }
     catch (e) {
      return;
    }
  }
  var onBodyDoneTimerId;
  function onBodyDone(){
    if (!bodyDone) {
      bodyDone = true;
      if (!__gwt_stylesLoaded['gwt/standard/standard.css']) {
        var l = $doc_0.createElement('link');
        __gwt_stylesLoaded['gwt/standard/standard.css'] = l;
        l.setAttribute('rel', 'stylesheet');
        l.setAttribute('href', base + 'gwt/standard/standard.css');
        $doc_0.getElementsByTagName('head')[0].appendChild(l);
      }
      maybeStartModule();
      if ($doc_0.removeEventListener) {
        $doc_0.removeEventListener('DOMContentLoaded', onBodyDone, false);
      }
      if (onBodyDoneTimerId) {
        clearInterval(onBodyDoneTimerId);
      }
    }
  }

  if ($doc_0.addEventListener) {
    $doc_0.addEventListener('DOMContentLoaded', function(){
      maybeInjectFrame();
      onBodyDone();
    }
    , false);
  }
  var onBodyDoneTimerId = setInterval(function(){
    if (/loaded|complete/.test($doc_0.readyState)) {
      maybeInjectFrame();
      onBodyDone();
    }
  }
  , 50);
  $stats && $stats({moduleName:'com.feller.picup.PickUp', sessionId:$sessionId_0, subSystem:'startup', evtGroup:'bootstrap', millis:(new Date).getTime(), type:'end'});
  $stats && $stats({moduleName:'com.feller.picup.PickUp', sessionId:$sessionId_0, subSystem:'startup', evtGroup:'loadExternalRefs', millis:(new Date).getTime(), type:'begin'});
  if (!__gwt_scriptsLoaded['qrcode.js']) {
    __gwt_scriptsLoaded['qrcode.js'] = true;
    document.write('<script language="javascript" src="' + base + 'qrcode.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['qrcode-gen.js']) {
    __gwt_scriptsLoaded['qrcode-gen.js'] = true;
    document.write('<script language="javascript" src="' + base + 'qrcode-gen.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['grid.js']) {
    __gwt_scriptsLoaded['grid.js'] = true;
    document.write('<script language="javascript" src="' + base + 'grid.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['version.js']) {
    __gwt_scriptsLoaded['version.js'] = true;
    document.write('<script language="javascript" src="' + base + 'version.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['detector.js']) {
    __gwt_scriptsLoaded['detector.js'] = true;
    document.write('<script language="javascript" src="' + base + 'detector.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['formatinf.js']) {
    __gwt_scriptsLoaded['formatinf.js'] = true;
    document.write('<script language="javascript" src="' + base + 'formatinf.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['errorlevel.js']) {
    __gwt_scriptsLoaded['errorlevel.js'] = true;
    document.write('<script language="javascript" src="' + base + 'errorlevel.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['bitmat.js']) {
    __gwt_scriptsLoaded['bitmat.js'] = true;
    document.write('<script language="javascript" src="' + base + 'bitmat.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['datablock.js']) {
    __gwt_scriptsLoaded['datablock.js'] = true;
    document.write('<script language="javascript" src="' + base + 'datablock.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['bmparser.js']) {
    __gwt_scriptsLoaded['bmparser.js'] = true;
    document.write('<script language="javascript" src="' + base + 'bmparser.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['datamask.js']) {
    __gwt_scriptsLoaded['datamask.js'] = true;
    document.write('<script language="javascript" src="' + base + 'datamask.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['rsdecoder.js']) {
    __gwt_scriptsLoaded['rsdecoder.js'] = true;
    document.write('<script language="javascript" src="' + base + 'rsdecoder.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['gf256poly.js']) {
    __gwt_scriptsLoaded['gf256poly.js'] = true;
    document.write('<script language="javascript" src="' + base + 'gf256poly.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['gf256.js']) {
    __gwt_scriptsLoaded['gf256.js'] = true;
    document.write('<script language="javascript" src="' + base + 'gf256.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['decoder.js']) {
    __gwt_scriptsLoaded['decoder.js'] = true;
    document.write('<script language="javascript" src="' + base + 'decoder.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['qrcode.js']) {
    __gwt_scriptsLoaded['qrcode.js'] = true;
    document.write('<script language="javascript" src="' + base + 'qrcode.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['findpat.js']) {
    __gwt_scriptsLoaded['findpat.js'] = true;
    document.write('<script language="javascript" src="' + base + 'findpat.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['alignpat.js']) {
    __gwt_scriptsLoaded['alignpat.js'] = true;
    document.write('<script language="javascript" src="' + base + 'alignpat.js"><\/script>');
  }
  if (!__gwt_scriptsLoaded['databr.js']) {
    __gwt_scriptsLoaded['databr.js'] = true;
    document.write('<script language="javascript" src="' + base + 'databr.js"><\/script>');
  }
  $doc_0.write('<script defer="defer">com_feller_picup_PickUp.onInjectionDone(\'com.feller.picup.PickUp\')<\/script>');
}

com_feller_picup_PickUp();
