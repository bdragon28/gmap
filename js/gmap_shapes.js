/**
 * GMap Shapes
 * GMap API version / Base case
 */
/* $Id$ */

Drupal.gmap.addHandler('gmap', function(elem) {
  var obj = this;
/*
  obj.bind('init',function() {
    if (obj.vars.behavior.autozoom) {
      obj.bounds = new GLatLngBounds(new GLatLng(obj.vars.latitude,obj.vars.longitude),new GLatLng(obj.vars.latitude,obj.vars.longitude));
    }
  });
*/
  obj.bind('addshape',function(shape) {
    //var m = new GMarker(new GLatLng(marker.latitude,marker.longitude),marker.opts);
    pa = []; // point array (array of GLatLng-objects)
    if (shape.type == 'circle') {
      shape.center = new GLatLng(shape.center.latitude, shape.center.longitude);
      pa = obj.poly.calcPolyPoints(shape.center, shape.radius, shape.numpoints);
    }
    else if (shape.type == 'rpolygon') {
      shape.center = new GLatLng(shape.center.latitude, shape.center.longitude);
      shape.point2 = new GLatLng(shape.point2.latitude, shape.point2.longitude);
      var radius = shape.center.distanceFrom(shape.point2);
      pa = obj.poly.calcPolyPoints(shape.center, radius, shape.numpoints);
    }
    else if(shape.type == 'polygon') { // CHECK: ??? always shape.type == 'polygon' here ???
      for(i = 0; i < shape.points.length; i++) {
        pp = shape.points[i];
        pa.push(new GLatLng(pp.latitude, pp.longitude));
      }
    }
    var sa = (shape.style) ? shape.style : [];
    // GPolygon(points, strokeColor?, strokeWeight?, strokeOpacity?,
    //          fillColor?,  fillOpacity?)
    shape.shape = new GPolygon(pa, sa[0], sa[1], sa[2], sa[3], sa[4]);
    obj.map.addOverlay(shape.shape);
    //if (obj.vars.behavior.autozoom) {
    //  obj.bounds.extend(marker.marker.getPoint());
    //  obj.map.setCenter(obj.bounds.getCenter(),obj.map.getBoundsZoomLevel(obj.bounds));
    //}
  });

  obj.bind('delshape',function(shape) {
    obj.map.removeOverlay(shape.shape);
  });

  obj.bind('clearshapes',function() {
    // @@@ Maybe don't nuke ALL overlays?
    obj.map.clearOverlays();
  });
});