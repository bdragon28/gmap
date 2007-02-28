/**
 * GMap Markers
 * Jef Poskanzer's Clusterer.js API version
 */
/* $Id$ */

Drupal.gmap.addHandler('gmap', function(elem) {
  var obj = this;
  obj.clusterer = new Clusterer(obj.map);
});

Drupal.gmap.marker.add = function(marker) {
  this.clusterer.AddMarker(marker,'FIXME');
};

Drupal.gmap.marker.del = function(marker) {
  this.clusterer.RemoveMarker(marker);
};