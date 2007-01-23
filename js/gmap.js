/* $Id$ */

Drupal.gmap = function() {
  this.controls = {};
  this.vars = {};
  this.map = undefined;
  this.bindings = {};
}
// Handlers setup
Drupal.gmap.prototype.handler = {};
// Handlers operating in array mode
Drupal.gmap.prototype.handler.gmap = new Array();

// Init the macro parts array here.
Drupal.gmap.prototype.macroparts = new Array();


/**
 * Subscribe to notification of a change.
 */
Drupal.gmap.prototype.bind = function(name,callback) {
  if(!this.bindings[name]) {
    this.bindings[name] = new Array();
  }
  var n = this.bindings[name].length;
  this.bindings[name][n] = callback;
  return n;
}

/**
 * Fire off notification of a change.
 */  
Drupal.gmap.prototype.change = function(name,id) {
  var s;
  var i;
  if (s = this.bindings[name]) {
    for (i = 0 ; i < s.length ; i++) {
      if (i != id) {
        (this.bindings[name][i])();
      }
    }
  }
  // Also fire off "all" event.
  if (s = this.bindings.all) {
    for (i = 0 ; i < s.length ; i++) {
      this.bindings.all[i]();
    }
  }
}

////////////////////////////////////////
//              Markers               //
////////////////////////////////////////
Drupal.gmap.prototype.markers = function(marker) {
  var theMarkers;
  if (!theMarkers) {
    theMarkers = {};
    var m = new GIcon();
    m.image = "http://www.google.com/mapfiles/marker.png";
    m.shadow = "http://www.google.com/mapfiles/shadow50.png";
    m.iconSize = new GSize(20, 34);
    m.shadowSize = new GSize(37,34);
    m.iconAnchor = new GPoint(9,34);
    m.infoWindowAnchor = new GPoint(9, 2);
    m.infoShadowAnchor = new GPoint(18, 25);
    theMarkers['standard'] = m;

    m = new GIcon();
    m.image = gmapMarkerLocation + "/big/blue.png";
    m.shadow = gmapMarkerLocation + "/big/shadow.png";
    m.iconsize=new GSize(30,51);
    m.shadowSize=new GSize(56,51);
    m.iconAnchor=new GPoint(13,34);
    m.infoWindowAnchor=new GPoint(13,3);
    m.infoShadowAnchor=new GPoint(27,37);
    theMarkers['big'] = m;

    m = new GIcon();
    m.image = gmapMarkerLocation + "/small/red.png";
    m.shadow = gmapMarkerLocation + "/small/shadow.png";
    m.iconSize = new GSize(12, 20);
    m.shadowSize = new GSize(22, 20);
    m.iconAnchor = new GPoint(6, 20);
    m.infoWindowAnchor = new GPoint(5, 1);
    theMarkers['small'] = m;

    m = new GIcon();
    m.image = gmapMarkerLocation + "/flat/x.png";
    m.shadow = "";
    m.iconSize = new GSize(16, 16);
    m.shadowSize = new GSize(0, 0);
    m.iconAnchor = new GPoint(8, 8);
    m.infoWindowAnchor = new GPoint(8, 8);
    theMarkers['flat'] = m;
  }
  return theMarkers[marker];
}

////////////////////////////////////////
//             Map widget             //
////////////////////////////////////////
Drupal.gmap.prototype.handler.gmap.push(function(elem) {
  var obj = this;
  // Make it a gmap.
  var map = new GMap2(elem);

  // Hide away a reference to the map
  obj.map = map;

  map.addControl(new GMapTypeControl());

  obj.bind("init",function() {
    if (obj.vars.behavior.nodrag) {
      map.disableDragging();
    }
    else if (!obj.vars.behavior.nokeyboard) {
      new GKeyboardHandler(map);
    }

    map.setCenter(new GLatLng(obj.vars.latitude,obj.vars.longitude), obj.vars.zoom);
  });

  // Respond to incoming zooms
  var binding = obj.bind("zoom",function(){map.setZoom(obj.vars.zoom)});
  // Send out outgoing zooms
  GEvent.addListener(map, "zoomend", function(oldzoom,newzoom) {
    obj.vars.zoom = newzoom;
    obj.change("zoom",binding);
  });

  // Respond to incoming moves
  binding = obj.bind("move",function(){map.panTo(new GLatLng(obj.vars.latitude,obj.vars.longitude))});
  // Send out outgoing moves
  GEvent.addListener(map,"moveend",function() {
    var coord = map.getCenter();
    obj.vars.latitude = coord.lat();
    obj.vars.longitude = coord.lng();
    obj.change("move",binding);
  });

  // Respond to incoming map type changes
  binding = obj.bind("maptypechange",function(){
    var type;
    if(obj.vars.maptype=='Map') type = G_NORMAL_MAP;
    if(obj.vars.maptype=='Hybrid') type = G_HYBRID_MAP;
    if(obj.vars.maptype=='Satellite') type = G_SATELLITE_MAP;
    map.setMapType(type);
  });
  // Send out outgoing map type changes.
  GEvent.addListener(map,"maptypechanged",function() {
    var type = map.getCurrentMapType();
    if(type==G_NORMAL_MAP) obj.vars.maptype = 'Map';
    if(type==G_HYBRID_MAP) obj.vars.maptype = 'Hybrid';
    if(type==G_SATELLITE_MAP) obj.vars.maptype = 'Satellite';
    obj.change("maptypechange",binding);
  });

  // Respond to incoming width changes.
  binding = obj.bind("widthchange",function(){map.getContainer().style.width = obj.vars.width});
  // Send out outgoing width changes.
  // N/A
  // Respond to incoming height changes.
  binding = obj.bind("heightchange",function(){map.getContainer().style.height = obj.vars.height});
  // Send out outgoing height changes.
  // N/A

  // Respond to incoming control type changes.
  binding = obj.bind("controltypechange",function() {
    if(obj.currentcontrol) {
      map.removeControl(obj.currentcontrol);
    }
    if (obj.vars.controltype=='Small') map.addControl(obj.currentcontrol = new GSmallMapControl());
    if (obj.vars.controltype=='Large') map.addControl(obj.currentcontrol = new GLargeMapControl());
  });
  // Send out outgoing control type changes.
  // N/A

  // Respond to incoming alignment changes.
  binding = obj.bind("alignchange",function() {
    var cont = map.getContainer();
    $(cont)
      .removeClass('gmap-left')
      .removeClass('gmap-center')
      .removeClass('gmap-right');
    if (obj.vars.align=='Left')   $(cont).addClass('gmap-left');
    if (obj.vars.align=='Center') $(cont).addClass('gmap-center');
    if (obj.vars.align=='Right')  $(cont).addClass('gmap-right');
  });
  // Send out outgoing alignment changes.
  // N/A
});

////////////////////////////////////////
//            Zoom widget             //
////////////////////////////////////////
Drupal.gmap.prototype.handler.zoom = function(elem) {
  var obj = this;
  // Respond to incoming zooms
  var binding = obj.bind("zoom",function(){elem.value = obj.vars.zoom});
  // Send out outgoing zooms
  $(elem).change(function() {
    obj.vars.zoom = parseInt(elem.value);
    obj.change("zoom",binding);
  });
}

////////////////////////////////////////
//          Latitude widget           //
////////////////////////////////////////
Drupal.gmap.prototype.handler.latitude = function(elem) {
  var obj = this;
  // Respond to incoming movements.
  var binding = obj.bind("move",function(){elem.value = ''+obj.vars.latitude});
  // Send out outgoing movements.
  $(elem).change(function() {
    obj.vars.latitude = this.value;
    obj.change("move",binding);
  });
}

////////////////////////////////////////
//         Longitude widget           //
////////////////////////////////////////
Drupal.gmap.prototype.handler.longitude = function(elem) {
  var obj = this;
  // Respond to incoming movements.
  var binding = obj.bind("move",function(){elem.value = ''+obj.vars.longitude});
  // Send out outgoing movements.
  $(elem).change(function() {
    obj.vars.longitude = this.value;
    obj.change("move",binding);
  });
}

////////////////////////////////////////
//          Latlon widget             //
////////////////////////////////////////
Drupal.gmap.prototype.handler.latlon = function(elem) {
  var obj = this;
  // Respond to incoming movements.
  var binding = obj.bind("move",function(){elem.value = ''+obj.vars.latitude+','+obj.vars.longitude});
  // Send out outgoing movements.
  $(elem).change(function() {
    var t = this.value.split(',');
    obj.vars.latitude = t[0];
    obj.vars.longitude = t[1];
    obj.change("move",binding);
  });
}

////////////////////////////////////////
//          Maptype widget            //
////////////////////////////////////////
Drupal.gmap.prototype.handler.maptype = function(elem) {
  var obj = this;
  // Respond to incoming movements.
  var binding = obj.bind("maptypechange",function(){elem.value = obj.vars.maptype});
  // Send out outgoing movements.
  $(elem).change(function() {
    obj.vars.maptype = elem.value;
    obj.change("maptypechange",binding);
  });
}

////////////////////////////////////////
//           Width widget             //
////////////////////////////////////////
Drupal.gmap.prototype.handler.width = function(elem) {
  var obj = this;
  // Respond to incoming width changes.
  var binding = obj.bind("widthchange",function(){elem.value = obj.vars.width});
  // Send out outgoing width changes.
  $(elem).change(function() {
    obj.vars.width = elem.value;
    obj.change("widthchange",binding);
  });
}

////////////////////////////////////////
//           Height widget            //
////////////////////////////////////////
Drupal.gmap.prototype.handler.height = function(elem) {
  var obj = this;
  // Respond to incoming height changes.
  var binding = obj.bind("heightchange",function(){elem.value = obj.vars.height});
  // Send out outgoing height changes.
  $(elem).change(function() {
    obj.vars.height = elem.value;
    obj.change("heightchange",binding);
  });
}

////////////////////////////////////////
//        Control type widget         //
////////////////////////////////////////
Drupal.gmap.prototype.handler.controltype = function(elem) {
  var obj = this;
  // Respond to incoming height changes.
  var binding = obj.bind("controltypechange",function(){elem.value = obj.vars.controltype});
  // Send out outgoing height changes.
  $(elem).change(function() {
    obj.vars.controltype = elem.value;
    obj.change("controltypechange",binding);
  });
}

////////////////////////////////////////
//           Map ID widget            //
////////////////////////////////////////
Drupal.gmap.prototype.handler.mapid = function(elem) {
  var obj = this;
  // Respond to incoming map id changes.
  var binding = obj.bind("idchange",function(){elem.value = obj.vars.id});
  // Send out outgoing map id changes.
  $(elem).change(function() {
    obj.vars.id = elem.value;
    obj.change("idchange",binding);
  });
}

Drupal.gmapAutoAttach = function() {

  // Init Google map facilities
  if (Drupal.settings && Drupal.settings.gmap) {
    for ( mapid in Drupal.settings.gmap ) {
      var map = new Drupal.gmap();
      map.vars = Drupal.settings.gmap[mapid];

      // If the vars are missing but latlong exists, use that.
      if (map.vars.latlong && (!map.vars.latitude || !map.vars.longitude)) {
        var t = map.vars.latlong.split(',');
        map.vars.latitude = t[0];
        map.vars.longitude = t[1];
      }

      for ( control in map.handler ) {
        $('.gmap-'+mapid+'-'+control).each(function() {
          // Handle arrays of functions
          if (typeof map.handler[control]!='function') {
            for (var i=0; i<map.handler[control].length; i++) {
              map.handler[control][i].call(map,this);
            }
          }
          else {
            map.handler[control].call(map,this);
          }
        });
      }
      map.change("init",-1);

      // Send some changed events to fire up the rest of the initial settings..
      map.change("maptypechange",-1);
      map.change("controltypechange",-1);
      map.change("alignchange",-1);

    }
  }
}

function gmap_validate_dim(dim) {
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

if (Drupal.jsEnabled) {
  $(document).ready(Drupal.gmapAutoAttach)
    .unload(function() {
      //Google cleanup.
      GUnload();
    });
}

//////////////////// Old functions below the line /////////////////////

function createIcon(marker) {
  var re = /markers\/([a-zA-Z0-9]+)\//;
    var m = re.exec(marker);
    var bicon='standard' ;
    if (m) {
      if (baseIcon[m[1]]) {
        var bicon=m[1];
      }
    }
    var markerIcon = new GIcon(baseIcon[bicon]);
    markerIcon.image = marker;
    return markerIcon;
}

function createGMarker(point, htmltext, marker, tooltip, towebsite) {
  if (marker.length >0) {

    var markerIcon=createIcon(marker);
    var returnMarker = new GMarker(point, {icon: markerIcon, title: tooltip});

  }
  else {
    var returnMarker = new GMarker(point, {title: tooltip});
  }
  if (!towebsite) towebsite='';
  // Show this htmltext  info window when it is clicked.
  if (towebsite.length>0 && markerlink){
    GEvent.addListener(returnMarker, 'click', function() {
      open(towebsite,'_self');
    });
  }
  else if (htmltext.length>0) {
    GEvent.addListener(returnMarker, 'click', function() {
      returnMarker.openInfoWindowHtml(htmltext);
    });
  }
  return returnMarker;
}

//moves thispoint based on the form with the id gmap-longitude and gmap-latitude
thispoint=false;

function gmap_textchange(thismap) {
  if (thispoint) {
    thismap.removeOverlay(thispoint);
  }
  thismap.panTo(newpoint=new GLatLng($("gmap-latitude").value, $("gmap-longitude").value));
  thismap.addOverlay(thispoint=new GMarker(newpoint));
}

/* geocoder old behavior...

  if (thispoint) {
    thismap.removeOverlay(thispoint);
  }
  thismap.panTo(newpoint=new GLatLng($("gmap-latitude").value, $("gmap-longitude").value));
  thismap.addOverlay(thispoint=new GMarker(newpoint));
}
*/

function createMarkerFromRSS(item,icon) {
  var title = item.getElementsByTagName("title")[0].childNodes[0].nodeValue;

  var description = item.getElementsByTagName("description")[0].childNodes[0].nodeValue;
  var link = item.getElementsByTagName("link")[0].childNodes[0].nodeValue;

  //SC Good practice is not to have to check for which browser - so just use specified NS in all cases
  if (navigator.userAgent.toLowerCase().indexOf("msie") < 0) {
    //SC   Non IE specific code (uses spec in MZ)
    if (item.getElementsByTagName("lat").length>0) {
      item.getElementsByTagName("lat")[0].normalize();
      if (item.getElementsByTagName("lat")[0].hasChildNodes()) {
        var lat = item.getElementsByTagName("lat")[0].childNodes[0].nodeValue;
        var lng = item.getElementsByTagName("long")[0].childNodes[0].nodeValue;
      }
    } else {
          if (item.getElementsByTagName("latitude").length>0) {
        item.getElementsByTagName("latitude")[0].normalize();
        if (item.getElementsByTagName("latitude")[0].hasChildNodes()) {
          var lat = item.getElementsByTagName("latitude")[0].childNodes[0].nodeValue;
          var lng = item.getElementsByTagName("longitude")[0].childNodes[0].nodeValue;
        }
      }
    }
  } else {
//SC  IE specific code - has to have specified NS in tagname wont work in MZ code
//SC  When checking for presence or NULL - IE considers .length attribute false
//SC   used active check like hasChildNodes
    if (null != item.getElementsByTagName("geourl:latitude")) {
//SC  The normalise function is not available (I think?) to IE so needs to be extracted
      var lat = item.getElementsByTagName("geourl:latitude")[0].childNodes[0].nodeValue;
      var lng = item.getElementsByTagName("geourl:longitude")[0].childNodes[0].nodeValue;
    } else {
      if (null != item.getElementsByTagName("icbm:latitude")) {
        var lat = item.getElementsByTagName("icbm:latitude")[0].childNodes[0].nodeValue;
        var lng = item.getElementsByTagName("icbm:longitude")[0].childNodes[0].nodeValue;
      } else {
        if (null != item.getElementsByTagName("geo:lat")) {
          //SC Be aware that with responseText it is likely that corrupted tags will
          // get through and you end up with badly formed numbers. As I suspect can happen here. 
          // thats why I left the geo tag til last - as that is still up in the air.
          var lat = item.getElementsByTagName("geo:lat")[0].childNodes[0].nodeValue;
          var lng = item.getElementsByTagName("geo:long")[0].childNodes[0].nodeValue;     
        }
      }
    }
  }
//SC  Finally we have it all to go ahead - we could concatenate HTML from description later.
  var point = new GLatLng(parseFloat(lat), parseFloat(lng));
  var html = "<a href=\"" + link + "\">" + title + "</a>";
  var marker=createGMarker(point, html, icon, title, link);

return marker;
}

function parseGeoRSS(map, rssurl,icon) {

  var request = GXmlHttp.create();
  request.open("GET", rssurl, true);
  request.onreadystatechange = function() {
    if (request.readyState == 4) {
//SC    var xmlDoc = request.responseXML;       IE does not respond to responseXML if not good
//SC                                              Google suggest their own interface for this
      var xmlDoc = GXml.parse(request.responseText);
//SC    var items = xmlDoc.documentElement.getElementsByTagName("item");    IE considers the
//SC                                                                        documentElement false
      var items = xmlDoc.getElementsByTagName("item");    
      for (var i = 0; i < items.length; i++) {
   
        var marker = createMarkerFromRSS(items[i], icon);
        map.addOverlay(marker);
      }

    }
  }
  request.send(null);
}


