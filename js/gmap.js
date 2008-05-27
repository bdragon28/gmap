/* $Id$ */

/**
 * Drupal to Google Maps API bridge.
 */

// GMap overseer singleton
Drupal.gmap = new function() {
  var _handlers = {};
  var _maps = {};

  /**
   * Retrieve a map object for use by a non-widget.
   * Use this if you need to be able to fire events against a certain map
   * which you have the mapid for.
   * Be a good GMap citizen! Remember to send change()s after modifying variables!
   */
  this.getMap = function(mapid) {
    return _maps[mapid];
  };

  this.addHandler = function(handler,callback) {
    if (!_handlers[handler]) {
      _handlers[handler] = [];
    }
    _handlers[handler].push(callback);
  };

  this.globalChange = function(name,userdata) {
    for (var mapid in Drupal.settings.gmap) {
      _maps[mapid].change(name,-1,userdata);
    }
  };

  this.setup = function() {
    if (Drupal.settings && Drupal.settings.gmap) {
      for (var mapid in Drupal.settings.gmap) {
        _maps[mapid] = new Drupal.gmap.map(Drupal.settings.gmap[mapid]);

        for (var control in _handlers) {
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

        _maps[mapid].change("bootstrap_options",-1);

        _maps[mapid].change("boot",-1);

        _maps[mapid].change("init",-1);

        // Send some changed events to fire up the rest of the initial settings..
        _maps[mapid].change("maptypechange",-1);
        _maps[mapid].change("controltypechange",-1);
        _maps[mapid].change("alignchange",-1);

        // Set ready to put the event system into action.
        _maps[mapid].ready = true;
        _maps[mapid].change("ready",-1);

      }
    }
  };
}();

Drupal.gmap.factory = {};

Drupal.gmap.map = function(v) {
  this.vars = v;
  this.map = undefined;
  this.ready = false;
  var _bindings = {};

  /**
   * Register interest in a change.
   */
  this.bind = function(name,callback) {
    if (!_bindings[name]) {
      _bindings[name] = [];
    }
    return _bindings[name].push(callback) - 1;
  };

  /**
   * Change notification.
   * Interested parties can act on changes.
   */
  this.change = function(name,id,userdata) {
    var c;
    if (_bindings[name]) {
      for (c = 0; c < _bindings[name].length; c++) {
        if (c != id) {
          _bindings[name][c](userdata);
        }
      }
    }
    if (name != 'all') {
      this.change('all',-1,name,userdata);
    }
  };

  /**
   * Deferred change notification.
   * This will cause a change notification to be tacked on to the *end* of the event queue.
   */
  this.deferChange = function(name,id,userdata) {
    var obj = this;
    // This will move the function call to the end of the event loop.
    setTimeout(function(){
      obj.change(name,id,userdata);
    }, 0);
  };
};

////////////////////////////////////////
//             Map widget             //
////////////////////////////////////////
Drupal.gmap.addHandler('gmap',function(elem) {
  var obj = this;

  obj.bind("bootstrap_options", function() {
    // Bootup options.
    var opts = {}; // Object literal GMapOptions
    obj.opts = opts;

    // Null out the enabled types.
    opts.mapTypes = [];

    // Load google map types.
    if (obj.vars.baselayers['Map']) {
      opts.mapTypes.push(G_NORMAL_MAP);
    }
    if (obj.vars.baselayers['Satellite']) {
      opts.mapTypes.push(G_SATELLITE_MAP);
    }
    if (obj.vars.baselayers['Hybrid']) {
      opts.mapTypes.push(G_HYBRID_MAP);
    }
    if (obj.vars.baselayers['Physical']) {
      opts.mapTypes.push(G_PHYSICAL_MAP);
    }

  });

  obj.bind("boot", function() {
    obj.map = new GMap2(elem, obj.opts);
  });

  obj.bind("init",function() {
    var map = obj.map;

    // Map type control
    if (obj.vars.mtc == 'standard') {
      map.addControl(new GMapTypeControl());
    }
    else if (obj.vars.mtc == 'hier') {
      map.addControl(new GHierarchicalMapTypeControl());
    }
    else if (obj.vars.mtc == 'menu') {
      map.addControl(new GMenuMapTypeControl());
    }

    if (obj.vars.behavior.overview) {
      map.addControl(new GOverviewMapControl());
    }
    if (obj.vars.behavior.scale) {
      map.addControl(new GScaleControl());
    }
    if (obj.vars.behavior.nodrag) {
      map.disableDragging();
    }
    else if (!obj.vars.behavior.nokeyboard) {
      obj._kbdhandler = new GKeyboardHandler(map);
    }
    if (obj.vars.behavior.collapsehack) {
      // Modify collapsable fieldsets to make maps check dom state when the resize handle
      // is clicked. This may not necessarily be the correct thing to do in all themes,
      // hence it being a behavior.
      setTimeout(function(){
        var r = function() {
          map.checkResize();
          map.setCenter(new GLatLng(obj.vars.latitude,obj.vars.longitude), obj.vars.zoom);
        };
        $(elem).parents('fieldset.collapsible').children('legend').children('a').click(r);
        // Would be nice, but doesn't work.
        //$(elem).parents('fieldset.collapsible').children('.fieldset-wrapper').scroll(r);
      },0);
    }
    map.setCenter(new GLatLng(obj.vars.latitude,obj.vars.longitude), obj.vars.zoom);
    if ($.fn.mousewheel && !obj.vars.behavior.nomousezoom) {
      $(elem).mousewheel(function(event, delta) {
        var zoom = map.getZoom();
        if (delta > 0) {
          zoom++;
        }
        else if (delta < 0) {
          zoom--;
        }
        map.setZoom(zoom);
        // Event handled.
        return false;
      });
    }

    // Send out outgoing zooms
    GEvent.addListener(obj.map, "zoomend", function(oldzoom,newzoom) {
      obj.vars.zoom = newzoom;
      obj.change("zoom",binding);
    });

    // Sync zoom if different after move.
    // Partial workaround for a zoom + move bug.
    // Full solution will involve listening to movestart and forbidding zooms
    // until complete.
    GEvent.addListener(map, "moveend", function() {
      if (map.getZoom() != obj.vars.zoom) {
        obj.change("zoom");
      }
    });

    // Send out outgoing moves
    GEvent.addListener(map,"moveend",function() {
      var coord = map.getCenter();
      obj.vars.latitude = coord.lat();
      obj.vars.longitude = coord.lng();
      obj.change("move",binding);
    });

    // Send out outgoing map type changes.
    GEvent.addListener(map,"maptypechanged",function() {
      // If the map isn't ready yet, ignore it.
      if (map.ready) {
        var type = map.getCurrentMapType();
        if(type==G_NORMAL_MAP) {obj.vars.maptype = 'Map';}
        if(type==G_HYBRID_MAP) {obj.vars.maptype = 'Hybrid';}
        if(type==G_SATELLITE_MAP) {obj.vars.maptype = 'Satellite';}
        obj.change("maptypechange",binding);
      }
    });

  });

  // Respond to incoming zooms
  var binding = obj.bind("zoom",function(){
    obj.map.setZoom(obj.vars.zoom);
  });

  // Respond to incoming moves
  binding = obj.bind("move", function(){
    obj.map.panTo(new GLatLng(obj.vars.latitude,obj.vars.longitude));
  });

  // Respond to incoming map type changes
  binding = obj.bind("maptypechange",function(){
    var type = false;
    if(obj.vars.maptype=='Map') {type = G_NORMAL_MAP;}
    if(obj.vars.maptype=='Hybrid') {type = G_HYBRID_MAP;}
    if(obj.vars.maptype=='Satellite') {type = G_SATELLITE_MAP;}
    if(obj.vars.maptype=='Physical') {type = G_PHYSICAL_MAP;}
    if (type) {
      obj.map.setMapType(type);
    }
  });

  // Respond to incoming width changes.
  binding = obj.bind("widthchange",function(w){
    obj.map.getContainer().style.width = w;
    obj.map.checkResize();
  });
  // Send out outgoing width changes.
  // N/A
  // Respond to incoming height changes.
  binding = obj.bind("heightchange",function(h){
    obj.map.getContainer().style.height = h;
    obj.map.checkResize();
  });
  // Send out outgoing height changes.
  // N/A

  // Respond to incoming control type changes.
  binding = obj.bind("controltypechange",function() {
    if(obj.currentcontrol) {
      obj.map.removeControl(obj.currentcontrol);
    }
    if (obj.vars.controltype=='Small') {obj.map.addControl(obj.currentcontrol = new GSmallMapControl());}
    if (obj.vars.controltype=='Large') {obj.map.addControl(obj.currentcontrol = new GLargeMapControl());}
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
  var binding = obj.bind("zoom", function(){
    elem.value = obj.vars.zoom;
  });
  // Send out outgoing zooms
  $(elem).change(function() {
    obj.vars.zoom = parseInt(elem.value, 10);
    obj.change("zoom", binding);
  });
});

////////////////////////////////////////
//          Latitude widget           //
////////////////////////////////////////
Drupal.gmap.addHandler('latitude', function(elem) {
  var obj = this;
  // Respond to incoming movements.
  var binding = obj.bind("move", function(){
    elem.value = '' + obj.vars.latitude;
  });
  // Send out outgoing movements.
  $(elem).change(function() {
    obj.vars.latitude = this.value;
    obj.change("move", binding);
  });
});

////////////////////////////////////////
//         Longitude widget           //
////////////////////////////////////////
Drupal.gmap.addHandler('longitude', function(elem) {
  var obj = this;
  // Respond to incoming movements.
  var binding = obj.bind("move", function(){
    elem.value = '' + obj.vars.longitude;
  });
  // Send out outgoing movements.
  $(elem).change(function() {
    obj.vars.longitude = this.value;
    obj.change("move", binding);
  });
});

////////////////////////////////////////
//          Latlon widget             //
////////////////////////////////////////
Drupal.gmap.addHandler('latlon', function(elem) {
  var obj = this;
  // Respond to incoming movements.
  var binding = obj.bind("move", function(){
    elem.value = '' + obj.vars.latitude + ',' + obj.vars.longitude;
  });
  // Send out outgoing movements.
  $(elem).change(function() {
    var t = this.value.split(',');
    obj.vars.latitude = t[0];
    obj.vars.longitude = t[1];
    obj.change("move", binding);
  });
});

////////////////////////////////////////
//          Maptype widget            //
////////////////////////////////////////
Drupal.gmap.addHandler('maptype', function(elem) {
  var obj = this;
  // Respond to incoming movements.
  var binding = obj.bind("maptypechange", function(){
    elem.value = obj.vars.maptype;
  });
  // Send out outgoing movements.
  $(elem).change(function() {
    obj.vars.maptype = elem.value;
    obj.change("maptypechange", binding);
  });
});

(function() { // BEGIN CLOSURE
  var re = /([0-9.]+)\s*(em|ex|px|in|cm|mm|pt|pc|%)/;
  var normalize = function(str) {
    var ar;
    if ((ar = re.exec(str.toLowerCase()))) {
      return ar[1] + ar[2];
    }
    return null;
  };
////////////////////////////////////////
//           Width widget             //
////////////////////////////////////////
Drupal.gmap.addHandler('width', function(elem) {
  var obj = this;
  // Respond to incoming width changes.
  var binding = obj.bind("widthchange", function(w){
    elem.value = normalize(w);
  });
  // Send out outgoing width changes.
  $(elem).change(function() {
    var n;
    if ((n = normalize(elem.value))) {
      elem.value = n;
      obj.change('widthchange', binding, n);
    }
  });
  obj.bind('init',function(){
    $(elem).change();
  });
});

////////////////////////////////////////
//           Height widget            //
////////////////////////////////////////
Drupal.gmap.addHandler('height', function(elem) {
  var obj = this;
  // Respond to incoming height changes.
  var binding = obj.bind("heightchange",function(h){
    elem.value = normalize(h);
  });
  // Send out outgoing height changes.
  $(elem).change(function() {
    var n;
    if ((n = normalize(elem.value))) {
      elem.value = n;
      obj.change('heightchange', binding, n);
    }
  });
  obj.bind('init',function(){
    $(elem).change();
  });
});

})(); // END CLOSURE

////////////////////////////////////////
//        Control type widget         //
////////////////////////////////////////
Drupal.gmap.addHandler('controltype', function(elem) {
  var obj = this;
  // Respond to incoming height changes.
  var binding = obj.bind("controltypechange", function(){
    elem.value = obj.vars.controltype;
  });
  // Send out outgoing height changes.
  $(elem).change(function() {
    obj.vars.controltype = elem.value;
    obj.change("controltypechange", binding);
  });
});

// Map setup / teardown.
if (Drupal.jsEnabled) {
  $(document).ready(Drupal.gmap.setup).unload(function() {
    //Google cleanup.
    GUnload();
  });
}
