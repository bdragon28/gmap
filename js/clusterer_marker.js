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
    var s = Drupal.settings.gmap_markermanager;
    if (s) {
      obj.clusterer.SetMaxVisibleMarkers(s.max_nocluster);
      obj.clusterer.SetMinMarkersPerCluster(s.cluster_min);
      obj.clusterer.SetMaxLinesPerInfoBox(s.max_lines);
    }
  });

  obj.bind('iconsready',function() {
    var s = Drupal.settings.gmap_markermanager;
    if (s) {
      obj.clusterer.SetIcon(Drupal.gmap.getIcon(s.marker,0));
    }
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
