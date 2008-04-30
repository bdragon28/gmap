/* $Id$ */

/**
 * GMap Shapes
 * GMap API version / Base case
 */

Drupal.gmap.addHandler('gmap', function(elem) {
  var obj = this;
/*
  obj.bind('init',function() {
    if (obj.vars.behavior.autozoom) {
      obj.bounds = new GLatLngBounds(new GLatLng(obj.vars.latitude,obj.vars.longitude),new GLatLng(obj.vars.latitude,obj.vars.longitude));
    }
  });
*/
  obj.bind('prepareshape',function(shape) {
    var i, pa, pp, cargs;
    //var m = new GMarker(new GLatLng(marker.latitude,marker.longitude),marker.opts);
    pa = []; // point array (array of GLatLng-objects)
    if (shape.type == 'circle') {
      pa = obj.poly.calcPolyPoints(new GLatLng(shape.center[0],shape.center[1]), shape.radius * 1000, shape.numpoints);
    }
    else if (shape.type == 'rpolygon') {
      shape.center = new GLatLng(parseFloat(shape.center.latitude),
                                 parseFloat(shape.center.longitude));
      shape.point2 = new GLatLng(parseFloat(shape.point2.latitude),
                                 parseFloat(shape.point2.longitude));
      var radius = shape.center.distanceFrom(shape.point2);
      pa = obj.poly.calcPolyPoints(shape.center, radius, shape.numpoints);
    }
    else if(shape.type == 'polygon') { // CHECK: ??? always shape.type == 'polygon' here ???
      for(i = 0; i < shape.points.length; i++) {
        pp = shape.points[i];
        pa.push(new GLatLng(parseFloat(pp.latitude), parseFloat(pp.longitude)));
      }
    }
    else if (shape.type == 'line') {
      $.each(shape.points, function(i,n) {
        pa.push(new GLatLng(n[0],n[1]));
      });
    }
    cargs = [pa];
    $.each(shape.style, function(i,n){
      cargs.push(n);
    });
    var Pg = function(args) {
      GPolygon.apply(this,args);
    };
    Pg.prototype = new GPolygon();
    var Pl = function(args) {
      GPolyline.apply(this,args);
    };
    Pl.prototype = new GPolyline();
    switch (shape.type) {
      case 'circle':
        shape.shape = new Pg(cargs);
        break;
      case 'line':
        shape.shape = new Pl(cargs);
        break;
    }
  });

  obj.bind('addshape', function(shape) {
    if (!obj.vars.shapes) {
      obj.vars.shapes = [];
    }
    obj.vars.shapes.push(shape);
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
    if (obj.vars.shapes) {
      $.each(obj.vars.shapes, function(i,n) {
        obj.change('delshape', -1, n);
      });
    }
  });
});
