 
/* $Id$ */

var baseIcon=new Array();
var geocoder = null;
 
function gmap_init() {
  baseIcon['standard'] = new GIcon();
  baseIcon['standard'].image = "http://www.google.com/mapfiles/marker.png";
  baseIcon['standard'].shadow = "http://www.google.com/mapfiles/shadow50.png"
  baseIcon['standard'].iconSize = new GSize(20, 34);
  baseIcon['standard'].shadowSize = new GSize(37, 34);
  baseIcon['standard'].iconAnchor = new GPoint(9, 34);
  baseIcon['standard'].infoWindowAnchor = new GPoint(9, 2);
  baseIcon['standard'].infoShadowAnchor = new GPoint(18, 25);
   
  baseIcon['big']=new GIcon();
  baseIcon['big'].image= gmapMarkerLocation + "/big/blue.png";
  baseIcon['big'].shadow=gmapMarkerLocation + "/big/shadow.png";
  baseIcon['big'].iconsize=new GSize(30,51);
  baseIcon['big'].shadowSize=new GSize(56,51);
  baseIcon['big'].iconAnchor=new GPoint(13,34);
  baseIcon['big'].infoWindowAnchor=new GPoint(13,3);
  baseIcon['big'].infoShadowAnchor=new GPoint(27,37);
   
  baseIcon['small'] = new GIcon();
  baseIcon['small'].image = gmapMarkerLocation + "/small/red.png";
  baseIcon['small'].shadow = gmapMarkerLocation + "/small/shadow.png";
  baseIcon['small'].iconSize = new GSize(12, 20);
  baseIcon['small'].shadowSize = new GSize(22, 20);
  baseIcon['small'].iconAnchor = new GPoint(6, 20);
  baseIcon['small'].infoWindowAnchor = new GPoint(5, 1);
  
  baseIcon['flat'] = new GIcon();
  baseIcon['flat'].image = gmapMarkerLocation + "/flat/x.png";
  baseIcon['flat'].shadow = "";
  baseIcon['flat'].iconSize = new GSize(16, 16);
  baseIcon['flat'].shadowSize = new GSize(0, 0);
  baseIcon['flat'].iconAnchor = new GPoint(8, 8);
  baseIcon['flat'].infoWindowAnchor = new GPoint(8, 8);

}

function createIcon(marker) {
  var re = /markers\/([a-zA-Z0-9]+)\//;
    var m = re.exec(marker);
    var bicon='standard' ;
    if (m) {
      if (baseIcon[m[1]]) {
        var bicon=m[1];
      }
    }
    var markerIcon = new GIcon(baseIcon[bicon]);
    markerIcon.image = marker;
    return markerIcon;
}

function createGMarker(point, htmltext, marker, tooltip, towebsite) {
  if (marker.length >0) {

    var markerIcon=createIcon(marker);
    var returnMarker = new GMarker(point, {icon: markerIcon, title: tooltip});

  }
  else {
    var returnMarker = new GMarker(point, {title: tooltip});
  }
  if (!towebsite) towebsite='';
  // Show this htmltext  info window when it is clicked.
  if (towebsite.length>0 && markerlink){
    GEvent.addListener(returnMarker, 'click', function() {
      open(towebsite,'_self');
    });
  }
  else if (htmltext.length>0) {
    GEvent.addListener(returnMarker, 'click', function() {
      returnMarker.openInfoWindowHtml(htmltext);
    });
  }
  return returnMarker;
}

//moves thispoint based on the form with the id gmap-longitude and gmap-latitude
thispoint=false;

function gmap_textchange(thismap) {
  if (thispoint) {
    thismap.removeOverlay(thispoint);
  }
  thismap.panTo(newpoint=new GLatLng($("gmap-latitude").value, $("gmap-longitude").value));
  thismap.addOverlay(thispoint=new GMarker(newpoint));
}

function gmap_geocodeaddress(thismap, address) {
  geocoder.getLatLng(
    address,
    function(point) {
      if (!point) {
        alert(address + " not found");
      } else {
        if (thispoint) {
          thismap.removeOverlay(thispoint);
        }
        thismap.setCenter(point, 13);
        var thispoint = new GMarker(point);
        thismap.addOverlay(thispoint);

       $("gmap-latitude").value=point.lat();
       $("gmap-longitude").value=point.lng();
      }
    }
  );
  if (thispoint) {
    thismap.removeOverlay(thispoint);
  }
  thismap.panTo(newpoint=new GLatLng($("gmap-latitude").value, $("gmap-longitude").value));
  thismap.addOverlay(thispoint=new GMarker(newpoint));
}

function createMarkerFromRSS(item,icon) {
  var title = item.getElementsByTagName("title")[0].childNodes[0].nodeValue;

  var description = item.getElementsByTagName("description")[0].childNodes[0].nodeValue;
  var link = item.getElementsByTagName("link")[0].childNodes[0].nodeValue;

  //SC Good practice is not to have to check for which browser - so just use specified NS in all cases
  if (navigator.userAgent.toLowerCase().indexOf("msie") < 0) {
    //SC   Non IE specific code (uses spec in MZ)
    if (item.getElementsByTagName("lat").length>0) {
      item.getElementsByTagName("lat")[0].normalize();
      if (item.getElementsByTagName("lat")[0].hasChildNodes()) {
        var lat = item.getElementsByTagName("lat")[0].childNodes[0].nodeValue;
        var lng = item.getElementsByTagName("long")[0].childNodes[0].nodeValue;
      }
    } else {
          if (item.getElementsByTagName("latitude").length>0) {
        item.getElementsByTagName("latitude")[0].normalize();
        if (item.getElementsByTagName("latitude")[0].hasChildNodes()) {
          var lat = item.getElementsByTagName("latitude")[0].childNodes[0].nodeValue;
          var lng = item.getElementsByTagName("longitude")[0].childNodes[0].nodeValue;
        }
      }
    }
  } else {
//SC  IE specific code - has to have specified NS in tagname wont work in MZ code
//SC  When checking for presence or NULL - IE considers .length attribute false
//SC   used active check like hasChildNodes
    if (null != item.getElementsByTagName("geourl:latitude")) {
//SC  The normalise function is not available (I think?) to IE so needs to be extracted
      var lat = item.getElementsByTagName("geourl:latitude")[0].childNodes[0].nodeValue;
      var lng = item.getElementsByTagName("geourl:longitude")[0].childNodes[0].nodeValue;
    } else {
      if (null != item.getElementsByTagName("icbm:latitude")) {
        var lat = item.getElementsByTagName("icbm:latitude")[0].childNodes[0].nodeValue;
        var lng = item.getElementsByTagName("icbm:longitude")[0].childNodes[0].nodeValue;
      } else {
        if (null != item.getElementsByTagName("geo:lat")) {
          //SC Be aware that with responseText it is likely that corrupted tags will
          // get through and you end up with badly formed numbers. As I suspect can happen here. 
          // thats why I left the geo tag til last - as that is still up in the air.
          var lat = item.getElementsByTagName("geo:lat")[0].childNodes[0].nodeValue;
          var lng = item.getElementsByTagName("geo:long")[0].childNodes[0].nodeValue;     
        }
      }
    }
  }
//SC  Finally we have it all to go ahead - we could concatenate HTML from description later.
  var point = new GLatLng(parseFloat(lat), parseFloat(lng));
  var html = "<a href=\"" + link + "\">" + title + "</a>";
  var marker=createGMarker(point, html, icon, title, link);

return marker;
}

function parseGeoRSS(map, rssurl,icon) {

  var request = GXmlHttp.create();
  request.open("GET", rssurl, true);
  request.onreadystatechange = function() {
    if (request.readyState == 4) {
//SC    var xmlDoc = request.responseXML;       IE does not respond to responseXML if not good
//SC                                              Google suggest their own interface for this
      var xmlDoc = GXml.parse(request.responseText);
//SC    var items = xmlDoc.documentElement.getElementsByTagName("item");    IE considers the
//SC                                                                        documentElement false
      var items = xmlDoc.getElementsByTagName("item");    
      for (var i = 0; i < items.length; i++) {
   
        var marker = createMarkerFromRSS(items[i], icon);
        map.addOverlay(marker);
      }

    }
  }
  request.send(null);
}


