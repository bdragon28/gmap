/**
 * GMap Markers
 * Jef Poskanzer's Clusterer.js API version
 */
/* $Id$ */

/**
 * GMap Markers
 * GMap API version / Base case
 */
/* $Id$ */

Drupal.gmap.addHandler('gmap', function(elem) {
  var obj = this;

  obj.bind('init',function() {
    obj.clusterer = new Clusterer(obj.map);
  });

  obj.bind('addmarker',function(marker) {
    var m = new GMarker(new GLatLng(marker.latitude,marker.longitude),marker.opts);
    var t;
    if (marker.title) {
      t = marker.title;
    }
    marker.marker = m;
    GEvent.addListener(m,'click',function() {
      obj.change('clickmarker',-1,marker);
    });
    obj.clusterer.AddMarker(m,t);
  });

  obj.bind('delmarker',function(marker) {
    obj.clusterer.RemoveMarker(marker.marker);
  });

  obj.bind('clearmarkers',function() {
    // @@@ Maybe don't nuke ALL overlays?
    obj.map.clearOverlays();
  });

  // Default marker actions.
  obj.bind('clickmarker',function(marker) {
    if (marker.text) {
      marker.marker.openInfoWindowHtml(marker.text);
    }
    if (marker.link) {
        open(marker.link,'_self');
    }
  });
});
