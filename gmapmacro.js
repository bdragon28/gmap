
/* $Id$ */
var map;
var mapdiv;
var colors;

if (isJsEnabled()) {
  addLoadEvent(gmap_init);
}

function gmap_args(args) {
  gmap_args = args;
}

function gmap_init() {
  if (!GBrowserIsCompatible()) { return; }
  
  mapdiv = $('map');
  map = new GMap2(mapdiv);
  
  var mycontrol = new GLargeMapControl();
  map.addControl(mycontrol);
  
  map.addControl(new GMapTypeControl());  
  map.setCenter(new GLatLng(0,0), 3);

   // extend the map object
  map.drupal = new Object();
  map.drupal.latLongStr = $('gmap-latlong').value;
  map.drupal.currentControlType = 'Large';
  map.drupal.currentControl = mycontrol;
  map.drupal.currentMapType = "Map";
  map.drupal.linecolors = colors;
  map.drupal.points = new Array();
  map.drupal.pointsOverlays = new Array() ;
  map.drupal.line1overlay=null;  map.drupal.line1points=new Array(); map.drupal.line1string=new String(); map.drupal.gmapline1=new String();
  map.drupal.line2overlay=null;  map.drupal.line2points=new Array(); map.drupal.line2string=new String(); map.drupal.gmapline2=new String();
  map.drupal.line3overlay=null;  map.drupal.line3points=new Array(); map.drupal.line3string=new String(); map.drupal.gmapline3=new String();
  $('gmap-macrotext').value = map_to_macro(map);
  
  // Event listeners
  GEvent.addListener(map, "dragend", function() {
    var center = map.getCenter();
    map.drupal.latLongStr = center.lat() + ', ' + center.lng() ;

    $('gmap-latlong').value = map.drupal.latLongStr;
    $('gmap-macrotext').value = map_to_macro(map);
  });
  
  GEvent.addListener(map, "zoomend", function(previouszoom,newzoom) {
    $('gmap-zoom').value = newzoom;
    $('gmap-macrotext').value = map_to_macro(map);

  });
  
  GEvent.addListener(map, "maptypechanged", function() {
    var maptype = map.getCurrentMapType();
    if (maptype == G_NORMAL_MAP) $('gmap-maptype').value = "Map";
    if (maptype == G_HYBRID_MAP) $('gmap-maptype').value = "Hybrid";
    if (maptype == G_SATELLITE_MAP) $('gmap-maptype').value = "Satellite";
    $('gmap-macrotext').value = map_to_macro(map);
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
      var selected = $('gmap-clicktype').value;
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
    $('gmap-macrotext').value = map_to_macro(map);
  });
  //initialize default values
  set_gmap_latlong($('gmap-latlong').value);
  map.setZoom($('gmap-zoom').value);
  set_gmap_type($('gmap-maptype').value);
  set_control_type($('gmap-controltype').value);
  set_gmap_dimension($('gmap-height'), 'height');
  set_gmap_dimension($('gmap-width'), 'width');
}

function gmap_set_line_colors(args) {
  colors = args;
}

/**
 * A generic function that takes the extended GMap object and returns a macro text.
 */
function map_to_macro(gmap) {
  var zooml = ' |zoom=' + gmap.getZoom();
  var centerStr = ' |center=' + gmap.drupal.latLongStr;
  var width = ' |width=' + $('gmap-width').value;
  var height = ' |height=' + $('gmap-height').value;
  var id = ' |id=' + gmap.drupal.mapid;
  var control = ' |control=' + gmap.drupal.currentControlType;
  var type = ' |type=' + gmap.drupal.currentMapType;
  
  // I don't know what alignment does or how to use it. Needs updating
//  var alignment = ' |align=' + gmapObj.alignment;

  var outpoints = new String();
  if (gmap.drupal.points.length > 0) {
    var outpoints = ' |markers=' + gmap.drupal.points.join(' + ');
  } 

  line1 = gmap.drupal.gmapline1.length >0 ? ' |line1=' + gmap.drupal.gmapline1 : '';
  line2 = gmap.drupal.gmapline2.length >0 ? ' |line2=' + gmap.drupal.gmapline2 : '';
  line3 = gmap.drupal.gmapline3.length >0 ? ' |line3=' + gmap.drupal.gmapline3 : '';

  return '[gmap' + id + centerStr + zooml + width + height +  /*alignment +*/ control + type + outpoints + line1 + line2 + line3 + ']';  
}

function set_gmap_latlong(instring) {
  var splitstring=instring.split(",");
  map.panTo(new GLatLng(splitstring[0],splitstring[1]));
}

function set_control_type(incontrol) {
  map.drupal.currentControlType = incontrol;
  if (map.drupal.currentControl) {
    map.removeControl(map.drupal.currentControl);
  }
  if (incontrol == "Small") map.addControl(map.drupal.currentControl = new GSmallMapControl());
  if (incontrol == "Large") map.addControl(map.drupal.currentControl = new GLargeMapControl());
  $('gmap-macrotext').value = map_to_macro(map);
}

function set_gmap_type(intype) {
  map.drupal.currentMapType = intype;
  if (intype == "Map") map.setMapType(G_NORMAL_MAP);
  if (intype == "Hybrid") map.setMapType(G_HYBRID_MAP);
  if (intype == "Satellite") map.setMapType(G_SATELLITE_MAP);
  $('gmap-macrotext').value = map_to_macro(map);
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
    $('gmap-macrotext').value = map_to_macro(map);
    set_gmap_latlong($('gmap-latlong').value);
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
  var newvalue = $('gmap-id').value;
  newvalue=newvalue.match(/^[0-9A-Za-z_-]+/);
  if (newvalue.length==0) {
    newvalue='map';
  }
  map.drupal.mapid = newvalue;
}
