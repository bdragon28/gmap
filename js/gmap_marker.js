/* $Id$ */

/**
 * GMap Markers
 * GMap API version -- No manager
 */

// Replace to override marker creation
Drupal.gmap.factory.marker = function(loc,opts) {
  return new GMarker(loc,opts);
};

Drupal.gmap.addHandler('gmap', function(elem) {
  var obj = this;

  obj.bind('addmarker',function(marker) {
    obj.map.addOverlay(marker.marker);
    if (obj.vars.behavior.autozoom) {
      // Init bounds if needed.
      // @@@ Unify bounds between markers and shapes? I really don't think this belongs here.
      if (!obj.bounds) {
        obj.bounds = new GLatLngBounds(marker.marker.getPoint(), marker.marker.getPoint());
      }
      else {
        obj.bounds.extend(marker.marker.getPoint());
      }
      obj.map.setCenter(obj.bounds.getCenter(), Math.min(obj.map.getBoundsZoomLevel(obj.bounds), obj.vars.maxzoom));
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
      obj.bounds = null;
    }
  });
});
