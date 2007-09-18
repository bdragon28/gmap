/**
 * GMap Markers
 * GMap API version -- No manager
 */
/* $Id$ */

// Replace to override marker creation
Drupal.gmap.factory.marker = function(loc,opts) {
  return new GMarker(loc,opts);
}

Drupal.gmap.addHandler('gmap', function(elem) {
  var obj = this;

  obj.bind('init',function() {
    if (obj.vars.behavior.autozoom) {
      obj.bounds = new GLatLngBounds(new GLatLng(obj.vars.latitude,obj.vars.longitude),new GLatLng(obj.vars.latitude,obj.vars.longitude));
    }
  });

  obj.bind('addmarker',function(marker) {
    var m = Drupal.gmap.factory.marker(new GLatLng(marker.latitude,marker.longitude),marker.opts);
    marker.marker = m;
    obj.map.addOverlay(m);
    if (obj.vars.behavior.autozoom) {
      obj.bounds.extend(marker.marker.getPoint());
      obj.map.setCenter(obj.bounds.getCenter(),obj.map.getBoundsZoomLevel(obj.bounds));
    }
  });

  obj.bind('delmarker',function(marker) {
    obj.map.removeOverlay(marker.marker);
  });

  obj.bind('clearmarkers',function() {
    // @@@ Maybe don't nuke ALL overlays?
    obj.map.clearOverlays();
    // Reset bounds if autozooming
    if (obj.vars.behavior.autozoom) {
      obj.bounds = new GLatLngBounds(new GLatLng(obj.vars.latitude,obj.vars.longitude),new GLatLng(obj.vars.latitude,obj.vars.longitude));
    }
  });
});
