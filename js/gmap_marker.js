/**
 * GMap Markers
 * GMap API version / Base case
 */
/* $Id$ */

// Replace to override marker creation
Drupal.gmap.factory.marker = function(loc,opts) {
  return new GMarker(loc,opts);
}

Drupal.gmap.addHandler('gmap', function(elem) {
  var obj = this;

  obj.bind('init',function() {
    if (obj.vars.behavior.autozoom) {
      obj.bounds = new GLatLngBounds(new GLatLng(obj.vars.latitude,obj.vars.longitude),new GLatLng(obj.vars.latitude,obj.vars.longitude));
    }
  });

  obj.bind('addmarker',function(marker) {
    var m = Drupal.gmap.factory.marker(new GLatLng(marker.latitude,marker.longitude),marker.opts);
    marker.marker = m;
    GEvent.addListener(m,'click',function() {
      obj.change('clickmarker',-1,marker);
    });
    if (obj.vars.behavior.extramarkerevents) {
      GEvent.addListener(m,'mouseover',function() {
        obj.change('mouseovermarker',-1,marker);
      });
      GEvent.addListener(m,'mouseout',function() {
        obj.change('mouseoutmarker',-1,marker);
      });
      GEvent.addListener(m,'dblclick',function() {
        obj.change('dblclickmarker',-1,marker);
      });
    }
    obj.map.addOverlay(m);
    if (obj.vars.behavior.autozoom) {
      obj.bounds.extend(marker.marker.getPoint());
      obj.map.setCenter(obj.bounds.getCenter(),obj.map.getBoundsZoomLevel(obj.bounds));
    }
    /**
     * Perform a synthetic marker click on this marker on load.
     */
    if (marker.autoclick || (marker.options && marker.options.autoclick)) {
      obj.deferChange('clickmarker',-1,marker);
    }
  });

  obj.bind('delmarker',function(marker) {
    obj.map.removeOverlay(marker.marker);
  });

  obj.bind('clearmarkers',function() {
    // @@@ Maybe don't nuke ALL overlays?
    obj.map.clearOverlays();
    // Reset bounds if autozooming
    if (obj.vars.behavior.autozoom) {
      obj.bounds = new GLatLngBounds(new GLatLng(obj.vars.latitude,obj.vars.longitude),new GLatLng(obj.vars.latitude,obj.vars.longitude));
    }
  });

  // Default marker actions.
  obj.bind('clickmarker',function(marker) {
    if (marker.text) {
      marker.marker.openInfoWindowHtml(marker.text);
    }
    else if (marker.tabs) {
      var infoWinTabs = [];
      for (m in marker.tabs) {
        infoWinTabs.push(new GInfoWindowTab(m,marker.tabs[m]));
      }
      marker.marker.openInfoWindowTabsHtml(infoWinTabs);
    }
    else if (marker.link) {
        open(marker.link,'_self');
    }
  });
});
