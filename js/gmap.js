/* $Id$ */

// GMap overseer singleton
Drupal.gmap = new function() {
  var _handlers = {};
  var _maps = {};
  var querypath;

  this.addHandler = function(handler,callback) {
    if (!_handlers[handler]) {
      _handlers[handler] = new Array();
    }
    _handlers[handler].push(callback);
  };

  this.globalChange = function(name) {
    for (var mapid in Drupal.settings.gmap) {
      _maps[mapid].change(name);
    }
  }

  this.setup = function() {
    if (Drupal.settings && Drupal.settings.gmap) {
      for (mapid in Drupal.settings.gmap) {
        _maps[mapid] = new Drupal.gmap.map(Drupal.settings.gmap[mapid]);
        
        // Pick up the query path for json requests.
        if (!Drupal.gmap.querypath) {
          Drupal.gmap.querypath = Drupal.settings.gmap[mapid].querypath;
        }

        for (control in _handlers) {
          var s = 0;
          do {
            var o = $('#gmap-'+mapid+'-'+control+s);
            o.each(function() {
                for (var i=0; i<_handlers[control].length; i++) {
                  _handlers[control][i].call(_maps[mapid],this);
                }
            });
            s++;
          }
          while (o.length>0);
        }

        _maps[mapid].change("init",-1);

        // Send some changed events to fire up the rest of the initial settings..
        _maps[mapid].change("maptypechange",-1);
        _maps[mapid].change("controltypechange",-1);
        _maps[mapid].change("alignchange",-1);

        // Set ready to put the event system into action.
        _maps[mapid].ready = true;

      }
    }
  }
}

Drupal.gmap.map = function(v) {
  this.vars = v;
  this.map = undefined;
  this.ready = false;
  var _bindings = {};
  this.bind = function(name,callback) {
    if (!_bindings[name]) {
      _bindings[name] = new Array();
    }
    return _bindings[name].push(callback) - 1;
  };

  this.change = function(name,id) {
    // If we aren't fully initted yet, ignore bound events.
    if (!this.ready && id!=-1) {
      return;
    }
    var c;
    if (_bindings[name]) {
      for (c=0; c<_bindings[name].length; c++) {
        if (c==id) continue;
        (_bindings[name][c])();
      }
    }
    if (name != 'all') {
      this.change('all',id);
    }
  };
};
Drupal.gmap.map.prototype.macroparts = Array();

// Init the macro parts array here.
//Drupal.gmap.prototype.macroparts = new Array();

////////////////////////////////////////
//             Map widget             //
////////////////////////////////////////
Drupal.gmap.addHandler('gmap',function(elem) {
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
});

////////////////////////////////////////
//            Zoom widget             //
////////////////////////////////////////
Drupal.gmap.addHandler('zoom', function(elem) {
  var obj = this;
  // Respond to incoming zooms
  var binding = obj.bind("zoom",function(){elem.value = obj.vars.zoom});
  // Send out outgoing zooms
  $(elem).change(function() {
    obj.vars.zoom = parseInt(elem.value);
    obj.change("zoom",binding);
  });
});

////////////////////////////////////////
//          Latitude widget           //
////////////////////////////////////////
Drupal.gmap.addHandler('latitude', function(elem) {
  var obj = this;
  // Respond to incoming movements.
  var binding = obj.bind("move",function(){elem.value = ''+obj.vars.latitude});
  // Send out outgoing movements.
  $(elem).change(function() {
    obj.vars.latitude = this.value;
    obj.change("move",binding);
  });
});

////////////////////////////////////////
//         Longitude widget           //
////////////////////////////////////////
Drupal.gmap.addHandler('longitude', function(elem) {
  var obj = this;
  // Respond to incoming movements.
  var binding = obj.bind("move",function(){elem.value = ''+obj.vars.longitude});
  // Send out outgoing movements.
  $(elem).change(function() {
    obj.vars.longitude = this.value;
    obj.change("move",binding);
  });
});

////////////////////////////////////////
//          Latlon widget             //
////////////////////////////////////////
Drupal.gmap.addHandler('latlon', function(elem) {
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
});

////////////////////////////////////////
//          Maptype widget            //
////////////////////////////////////////
Drupal.gmap.addHandler('maptype', function(elem) {
  var obj = this;
  // Respond to incoming movements.
  var binding = obj.bind("maptypechange",function(){elem.value = obj.vars.maptype});
  // Send out outgoing movements.
  $(elem).change(function() {
    obj.vars.maptype = elem.value;
    obj.change("maptypechange",binding);
  });
});

////////////////////////////////////////
//           Width widget             //
////////////////////////////////////////
Drupal.gmap.addHandler('width', function(elem) {
  var obj = this;
  // Respond to incoming width changes.
  var binding = obj.bind("widthchange",function(){elem.value = obj.vars.width});
  // Send out outgoing width changes.
  $(elem).change(function() {
    obj.vars.width = elem.value;
    obj.change("widthchange",binding);
  });
});

////////////////////////////////////////
//           Height widget            //
////////////////////////////////////////
Drupal.gmap.addHandler('height', function(elem) {
  var obj = this;
  // Respond to incoming height changes.
  var binding = obj.bind("heightchange",function(){elem.value = obj.vars.height});
  // Send out outgoing height changes.
  $(elem).change(function() {
    obj.vars.height = elem.value;
    obj.change("heightchange",binding);
  });
});

////////////////////////////////////////
//        Control type widget         //
////////////////////////////////////////
Drupal.gmap.addHandler('controltype', function(elem) {
  var obj = this;
  // Respond to incoming height changes.
  var binding = obj.bind("controltypechange",function(){elem.value = obj.vars.controltype});
  // Send out outgoing height changes.
  $(elem).change(function() {
    obj.vars.controltype = elem.value;
    obj.change("controltypechange",binding);
  });
});

////////////////////////////////////////
//           Map ID widget            //
////////////////////////////////////////
Drupal.gmap.addHandler('mapid', function(elem) {
  var obj = this;
  // Respond to incoming map id changes.
  var binding = obj.bind("idchange",function(){elem.value = obj.vars.id});
  // Send out outgoing map id changes.
  $(elem).change(function() {
    obj.vars.id = elem.value;
    obj.change("idchange",binding);
  });
});


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
  $(document).ready(Drupal.gmap.setup)
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


