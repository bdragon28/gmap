/**
 * GMap Markers
 * GMap API version
 */
Drupal.gmap.prototype.marker = {};

Drupal.gmap.prototype.marker.init = function(map) {
  //NA
}

Drupal.gmap.prototype.marker.makeMarker = function(markerdef) {
  var opts = {};
  if (markerdef.tooltip) {
    opts.title = markerdef.tooltip; // @@@
  }
  var marker = new GMarker(new GLatLng(markerdef.latitude,markerdef.longitude),opts);

//  if (markerdef.info) {

  // @@@
  GEvent.addListener(marker,'click',function() {
    marker.openInfoWindowHtml('<p>FOO!!!</p>');
  });
    


  return marker;
}

/**
 * Add a marker.
 */
Drupal.gmap.prototype.marker.add = function(marker) {
  var obj = this;
  obj.map.addOverlay(marker);
}

Drupal.gmap.prototype.marker.del = function(marker) {
  this.map.removeOverlay(marker);
}

// Add a gmap handler
Drupal.gmap.prototype.handler.gmap.push(function(elem) {
  var obj = this;

  if(obj.vars.markers) {
    obj.bind("init",function() {

      for (var i=0; i<obj.vars.markers.length; i++) {
        obj.marker.add.call(obj,(obj.marker.makeMarker(obj.vars.markers[i])));
      }
    });
  }
});  
