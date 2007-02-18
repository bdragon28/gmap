/* $Id$ */

/**
 * Location chooser interface.
 */

Drupal.gmap.addHandler('gmap',function(elem) {
  var obj = this;

  var binding = obj.bind("locpickchange", function() {
    if (obj.locpick_coord) {
      GEvent.trigger(obj.map,"click",null,obj.locpick_coord);
    }
  });

  obj.bind("init", function() {
    if (obj.vars.behavior.locpick) {
      obj.locpick_coord = new GLatLng(obj.vars.latitude, obj.vars.longitude);

      GEvent.addListener(obj.map, "click", function(overlay,point) {
        obj.map.checkResize();
        if (!overlay) {
          if (obj.locpick_point) {
            obj.map.removeOverlay(obj.locpick_point);
          }
          obj.map.panTo(point);
          obj.map.zoomIn();
          obj.map.zoomIn();
          obj.map.addOverlay(obj.locpick_point = new GMarker(point));
          obj.locpick_coord = point;
          obj.change('locpickchange', binding);
        }
        else {
          // Unsetting the location
          obj.map.removeOverlay(obj.locpick_point);
          obj.locpick_coord = null;
          obj.change('locpickchange', binding);
        }
      });
    }
  });

  obj.bind("ready", function() {
    // Fake a click to set the initial point.
    if (obj.vars.behavior.locpick) {
      obj.change('locpickchange', -1);
    }
  });

});

Drupal.gmap.addHandler('locpick_latitude',function(elem) {
  var obj = this;
  
  obj.bind("init", function() {
    obj.vars.latitude = Number(elem.value);
    obj.locpick_coord = new GLatLng(obj.vars.latitude, obj.vars.longitude);
  });

  var binding = obj.bind("locpickchange", function() {
    if (obj.locpick_coord) {
      elem.value = obj.locpick_coord.lat();
    }
    else {
      elem.value = '';
    }
  });

  $(elem).change(function() {
    obj.locpick_coord = new GLatLng(Number(elem.value), obj.locpick_coord.lng());
    obj.change('locpickchange', binding);
  });
});

Drupal.gmap.addHandler('locpick_longitude', function(elem) {
  var obj = this;

  obj.bind("init", function() {
    obj.vars.longitude = Number(elem.value);
    obj.locpick_coord = new GLatLng(obj.vars.latitude, obj.vars.longitude);
  });

  var binding = obj.bind("locpickchange", function() {
    if (obj.locpick_coord) {
      elem.value = obj.locpick_coord.lng();
    }
    else {
      elem.value = '';
    }
  });

  $(elem).change(function() {
    obj.locpick_coord = new GLatLng(obj.locpick_coord.lat(), Number(elem.value));
    obj.change('locpickchange', binding);
  });
});

