 
/* $Id$ */

 var baseIcon;
 
 function gmap_init() {
   baseIcon = new GIcon();
   baseIcon.image = "http://www.google.com/mapfiles/marker.png";
   baseIcon.shadow = "http://www.google.com/mapfiles/shadow50.png";
   baseIcon.iconSize = new GSize(20, 34);
   baseIcon.shadowSize = new GSize(37, 34);
   baseIcon.iconAnchor = new GPoint(9, 34);
   baseIcon.infoWindowAnchor = new GPoint(9, 2);
   baseIcon.infoShadowAnchor = new GPoint(18, 25);
}

function createGMarker(point, htmltext, marker) {
  if (marker.length >0) {
    var markerIcon = new GIcon(baseIcon);
    markerIcon.image = marker;
    var returnMarker = new GMarker(point, markerIcon);
  }
  else {
    var returnMarker = new GMarker(point);
  }

  // Show this htmltext  info window when it is clicked.
  if (htmltext.length>0) {
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

function createMarkerFromRSS(item,icon) {
  var title = item.getElementsByTagName("title")[0].childNodes[0].nodeValue;

//  var description = item.getElementsByTagName("description")[0].childNodes[0].nodeValue;
  var link = item.getElementsByTagName("link")[0].childNodes[0].nodeValue;
//  alert('Link: ' +link);
  // namespaces are handled by spec in moz, not in ie  -- Looking for a better more universal parsing routine.
  if (navigator.userAgent.toLowerCase().indexOf("msie") < 0) {
    // Is there a geo:lat defined?
    if (item.getElementsByTagNameNS("http://www.w3.org/2003/01/geo/wgs84_pos#","lat").length>0) {
      item.getElementsByTagNameNS("http://www.w3.org/2003/01/geo/wgs84_pos#","lat")[0].normalize();
      // Is there a value for geo:lat
      if (item.getElementsByTagNameNS("http://www.w3.org/2003/01/geo/wgs84_pos#","lat")[0].hasChildNodes()) {
        // Then there probably is a geo:long too
        var lat = item.getElementsByTagNameNS("http://www.w3.org/2003/01/geo/wgs84_pos#","lat")[0].childNodes[0].nodeValue;
        var lng = item.getElementsByTagNameNS("http://www.w3.org/2003/01/geo/wgs84_pos#","long")[0].childNodes[0].nodeValue;
      }
    }
  } else {
    var lat = item.getElementsByTagName("geo:lat")[0].childNodes[0].nodeValue;
    if (lat == undefined) {
      lat = item.getElementsByTagName("icbm:lat")[0].childNodes[0].nodeValue;
    }
    var lng = item.getElementsByTagName("geo:long")[0].childNodes[0].nodeValue;
    if (lng == undefined) {
      lng = item.getElementsByTagName("icbm:long")[0].childNodes[0].nodeValue;
    }
  }
  //alert('Lat: '+lat);
  var point = new GLatLng(parseFloat(lat), parseFloat(lng));
  var html = "<a href=\"" + link + "\">" + title + "</a>";
  var marker=createGMarker(point, html, icon);

return marker;
}

function parseGeoRSS(map, rssurl,icon) {

  var request = GXmlHttp.create();
  request.open("GET", rssurl, true);
  request.onreadystatechange = function() {
    if (request.readyState == 4) {
      var xmlDoc = request.responseXML;
      var items = xmlDoc.documentElement.getElementsByTagName("item");
      for (var i = 0; i < items.length; i++) {

        var marker = createMarkerFromRSS(items[i], icon);
        map.addOverlay(marker);
      }

    }
  }
  request.send(null);
}


