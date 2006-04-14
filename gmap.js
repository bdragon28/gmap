 
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
