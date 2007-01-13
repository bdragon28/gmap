/* $Id$ */

////////////////////////////////////////
//           Macro widget             //
////////////////////////////////////////

/**
 * Widget handler.
 */
Drupal.gmap.prototype.handler.macrotext = function(elem) {
  var obj = this;
  // Update macro every time something happens.
  obj.bind('all',function(){elem.value = obj.macro.call(obj)});
}

/**
 * Extensible macros @@@
 */
Drupal.gmap.prototype.parse = function(m) {
  // Trim off outside tag
  if (m.substr(0,5)=='[gmap') {
    m = m.slice(6,-1);
  }
}

/**
 * Get the current state as a macro.
 * @@@ Make this extensible or something...
 */
Drupal.gmap.prototype.macro = function() {
  var o = '[gmap';

  o+=' |zoom='    + this.vars.zoom;
  o+=' |center='  + this.vars.latitude+','+this.vars.longitude;
  o+=' |width='   + this.vars.width;
  o+=' |height='  + this.vars.height;
  o+=' |id='      + this.vars.id;
  o+=' |control=' + this.vars.controltype;
  // @@@ Use maptype instead, accept old and new.
  o+=' |type='    + this.vars.maptype;
  o+=' |align='   + this.vars.align;

  for (var i=0; i<this.macroparts.length; i++) {
    o+= this.macroparts[i].call(this);
  }

  // @@@ Wouldn't it be simpler to have an arbitrary # of lines?
  if (this.vars.line1.length >0) o += ' |line1=' + this.vars.line1;
  if (this.vars.line2.length >0) o += ' |line2=' + this.vars.line2;
  if (this.vars.line3.length >0) o += ' |line3=' + this.vars.line3;

  o+= ']';
  return o;
}
///////////////////////// Old stuff below this line //////////////////////

function gmap_init() {
  if (!GBrowserIsCompatible()) { return; }

  $('div#map').each(function() {
     mapdiv = this;
  });
  map = new GMap2(mapdiv);
  
  keyboardhandler=new GKeyboardHandler(map);
  
  var mycontrol = new GLargeMapControl();
  map.addControl(mycontrol);
  
  map.addControl(new GMapTypeControl());  
  map.setCenter(new GLatLng(0,0), 3);

   // extend the map object
  map.drupal = new Object();
  map.drupal.mapid = $('#gmap-mapid').val();
  map.drupal.latLongStr = $('#gmap-latlong').val();
  map.drupal.currentControlType = 'Large'; // $('#gmap-maptype').val();
  map.drupal.currentControl = mycontrol;
  map.drupal.linecolors = colors;
  map.drupal.points = new Array();
  map.drupal.pointsOverlays = new Array() ;
  map.drupal.line1overlay=null;  map.drupal.line1points=new Array(); map.drupal.line1string=new String(); map.drupal.gmapline1=new String();
  map.drupal.line2overlay=null;  map.drupal.line2points=new Array(); map.drupal.line2string=new String(); map.drupal.gmapline2=new String();
  map.drupal.line3overlay=null;  map.drupal.line3points=new Array(); map.drupal.line3string=new String(); map.drupal.gmapline3=new String();
  $('#gmap-macrotext').val(map_to_macro(map));
  
  // Event listeners
  GEvent.addListener(map, "moveend", function() {
    var center = map.getCenter();
    map.drupal.latLongStr = center.lat() + ', ' + center.lng() ;

    $('#gmap-latlong').val(map.drupal.latLongStr);
    $('#gmap-macrotext').val(map_to_macro(map));
  });
  
  GEvent.addListener(map, "zoomend", function(previouszoom,newzoom) {
    $('#gmap-zoom').val(newzoom);
    $('#gmap-macrotext').val(map_to_macro(map));

  });
  
  GEvent.addListener(map, "maptypechanged", function() {
    var maptype = map.getCurrentMapType();
    if (maptype == G_NORMAL_MAP) $('#gmap-maptype').val("Map");
    if (maptype == G_HYBRID_MAP) $('#gmap-maptype').val("Hybrid");
    if (maptype == G_SATELLITE_MAP) $('#gmap-maptype').val("Satellite");
    $('#gmap-macrotext').val(map_to_macro(map));
  });

  GEvent.addListener(map, 'click', function(overlay, point) {
    if (overlay) {
      var shft=false;
      for (i=0; i<map.drupal.points.length; i++){
        if (overlay==map.drupal.pointsOverlays[i]) {
          shft=true;
        }
        if (shft==true) {
          if (i<map.drupal.points.length) {
            map.drupal.pointsOverlays[i]=map.drupal.pointsOverlays[i+1];
            map.drupal.points[i]=map.drupal.points[i+1];
          }
        }
      }
      map.drupal.points.pop();
      map.drupal.pointsOverlays.pop();
      map.removeOverlay(overlay);
    }
    else if (point) {
      var selected = $('#gmap-clicktype').val();
      switch (selected) {
        // I've got the feeling that some of the following logic could be trimmed
        case 'Points':
          map.addOverlay(marker=new GMarker(point));
          map.drupal.pointsOverlays.push(marker);
          map.drupal.points.push(point.lat() + ',' + point.lng());
          break;
    
        case 'Line1':
          map.drupal.line1points.push(point);
          if (map.drupal.line1overlay) map.removeOverlay(map.drupal.line1overlay);
          map.drupal.line1overlay=new GPolyline(map.drupal.line1points, map.drupal.linecolors[0], 5);
          map.addOverlay(map.drupal.line1overlay);
          if (map.drupal.line1string.length > 0) map.drupal.line1string += ' + ';
          map.drupal.line1string += point.lat() + ',' + point.lng();
          map.drupal.gmapline1 = map.drupal.line1string;
          break;
  
        case 'Line2':
          map.drupal.line2points.push(point);
          if (map.drupal.line2overlay) map.removeOverlay(map.drupal.line2overlay);
          map.drupal.line2overlay=new GPolyline(map.drupal.line2points, map.drupal.linecolors[1], 5);
          map.addOverlay(map.drupal.line2overlay);
          if (map.drupal.line2string.length > 0) map.drupal.line2string += ' + ';
          map.drupal.line2string += point.lat() + ',' + point.lng();
          map.drupal.gmapline2 = map.drupal.line2string;
          break;
    
        case 'Line3':
          map.drupal.line3points.push(point);
          if (map.drupal.line3overlay) map.removeOverlay(map.drupal.line3overlay);
          map.drupal.line3overlay=new GPolyline(map.drupal.line3points, map.drupal.linecolors[2], 5);
          map.addOverlay(map.drupal.line3overlay);
          if (map.drupal.line3string.length > 0) map.drupal.line3string += ' + ';
          map.drupal.line3string += point.lat() + ',' + point.lng();
          map.drupal.gmapline3 = map.drupal.line3string;
          break;
      }      
    }
    $('#gmap-macrotext').val(map_to_macro(map));
  });
  //initialize default values
  set_gmap_latlong($('#gmap-latlong').val());
  map.setZoom(parseInt($('#gmap-zoom').val()));
  set_gmap_type($('#gmap-maptype').val());
  set_control_type($('#gmap-controltype').val());
  set_gmap_dimension($('#gmap-height').val(), 'height');
  set_gmap_dimension($('#gmap-width').val(), 'width');
}

function set_gmap_dimension(elem, dimension) {
  var valid_value = validate_dim(elem.value);
  if (valid_value) {
    container=map.getContainer();
    if (dimension == 'height') {
      container.style.height = valid_value;
      elem.value = valid_value;
    } 
    else if (dimension == 'width') {
      container.style.width = valid_value;
      elem.value = valid_value;
    }
 //   gmap_init(map);
    map.checkResize();
    $('#gmap-macrotext').val(map_to_macro(map));
    set_gmap_latlong($('#gmap-latlong').val());
  }
}

function validate_dim(dim) {
  return dim;
  //needs to be fixed to allow either 'px' or '%'
  var reg = /(\d+)/;
  var ar = reg.exec(dim);
  try {
    valid_dim = ar[0] + 'px';
    return valid_dim;
  } catch (e) {alert(e);
    return false;
  }
}

function newid() {
  var newvalue = $('#gmap-mapid').val();
  newvalue=newvalue.match(/^[0-9A-Za-z_-]+/);
  if (newvalue.length==0) {
    newvalue='map';
  }
  map.drupal.mapid = newvalue;
}
