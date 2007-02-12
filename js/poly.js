/* $Id$ */
/**
 * GPolyLine / GPolygon manager
 * 
 */

Drupal.gmap.map.prototype.poly = {};

/**
 * Distance in pixels between 2 points.
 */
Drupal.gmap.map.prototype.poly.distance = function(point1,point2) {
  return Math.sqrt(Math.pow(point2.x - point1.x,2)+Math.pow(point2.y - point1.y,2));
}

/**
 * Circle -- Following projection.
 */
Drupal.gmap.map.prototype.poly.computeCircle = function(obj,center,point2) {
  var numSides = 36;
  var sideInc = 10; // 360 / 20 = 18 degrees
  var convFactor = Math.PI/180;
  var points = Array();
  var radius = obj.poly.distance(center,point2);
  // 36 sided poly ~= circle
  for (var i = 0; i <= numSides; i++) {
    var rad = i*sideInc*convFactor;
    var x = center.x + radius * Math.cos(rad);
    var y = center.y + radius * Math.sin(rad);
    //points.push(obj.map.getCurrentMapType().getProjection().fromPixelToLatLng(new GPoint(x,y),obj.map.getZoom()));
    points.push(new GPoint(x,y));
  }
  return points;
};

/**
 * Circle -- on screen.
 */
//Drupal.gmap.map.prototype.

