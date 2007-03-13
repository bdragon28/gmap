/**
 * GMap Markers
 * GMap API version / Base case
 */
/* $Id$ */

Drupal.gmap.marker = {};

Drupal.gmap.marker.init = function(map) {
  //NA
}

Drupal.gmap.marker.makeMarker = function(markerdef,seq) {
  var opts = {};
  if (markerdef.tooltip) {
    opts.title = markerdef.tooltip; // @@@
  }
  if (markerdef.markername) {
    opts.icon = Drupal.gmap.getIcon(markerdef.markername,seq);
  }
  else {
    opts.icon = Drupal.gmap.getIcon();
  }

  var marker = new GMarker(new GLatLng(markerdef.latitude,markerdef.longitude),opts);

  if (markerdef.text) {
    GEvent.addListener(marker,'click',function() {
      marker.openInfoWindowHtml(markerdef.text);
      });
  }

  // @@@ Extend this a bit.
  if (markerdef.link) {
    GEvent.addListener(marker,'click',function() {
      open(markerdef.link,'_self');
    });
  }

  return marker;
}

/**
 * Add a marker.
 */
Drupal.gmap.marker.add = function(marker) {
  var obj = this;
  obj.map.addOverlay(marker);
  if(obj.vars.behavior.autozoom) {
    obj.bounds.extend(marker.getPoint());
  }
}

/**
 * Remove a marker.
 */
Drupal.gmap.marker.del = function(marker) {
  this.map.removeOverlay(marker);
}

Drupal.gmap.addHandler('gmap', function(elem) {
  var obj = this;

  obj.bind('init',function() {
    if (obj.vars.behavior.autozoom) {
      obj.bounds = new GLatLngBounds(new GLatLng(obj.vars.latitude,obj.vars.longitude),new GLatLng(obj.vars.latitude,obj.vars.longitude));
    }
  });
  obj.bind('addmarker',function(marker) {
    var m = new GMarker(new GLatLng(marker.latitude,marker.longitude),marker.opts);
    marker.marker = m;
    GEvent.addListener(m,'click',function() {
      obj.change('clickmarker',-1,marker);
    });
    obj.map.addOverlay(m);
    if (obj.vars.behavior.autozoom) {
      obj.bounds.extend(marker.marker.getPoint());
      obj.map.setCenter(obj.bounds.getCenter(),obj.map.getBoundsZoomLevel(obj.bounds));
    }
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

/*
// Add a gmap handler
Drupal.gmap.addHandler('gmap', function(elem) {
  var obj = this;

  if(obj.vars.markers) {
    obj.bind("markersready",function() {
      if (obj.vars.behavior.autozoom) {
        obj.bounds = new GLatLngBounds(new GLatLng(obj.vars.latitude,obj.vars.longitude),new GLatLng(obj.vars.latitude,obj.vars.longitude));
      }

      for (var i=0; i<obj.vars.markers.length; i++) {
        Drupal.gmap.marker.add.call(obj,(Drupal.gmap.marker.makeMarker(obj.vars.markers[i],i)));
      }
      if (obj.vars.lines && obj.vars.lines.length>0) {
        for (var i=0; i<obj.vars.lines.length; i++) {
          var temp = [];
          if (obj.vars.lines[i] && obj.vars.lines[i].length>1) {
            for (var j=0; j<obj.vars.lines[i].length; j++) {
              temp.push(new GLatLng(obj.vars.lines[i][j].latitude,obj.vars.lines[i][j].longitude));
            }
            obj.map.addOverlay(new GPolyline(temp,obj.vars.line_colors[i], 5));
//            if (obj.vars.behavior.autozoom) {
//              for(var k=0;k<poly.getVertexCount();k++) {
//                obj.bounds.extend(
          }
        }
      }
    });
  }
});  
*/