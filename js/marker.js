/* $Id$ */

/**
 * Common marker routines.
 */

Drupal.gmap.addHandler('gmap', function(elem) {
  var obj = this;

  obj.bind('addmarker',function(marker) {
    var m = Drupal.gmap.factory.marker(new GLatLng(marker.latitude,marker.longitude), marker.opts);
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
    /**
     * Perform a synthetic marker click on this marker on load.
     */
    if (marker.autoclick || (marker.options && marker.options.autoclick)) {
      obj.deferChange('clickmarker',-1,marker);
    }
  });

  // Default marker actions.
  obj.bind('clickmarker',function(marker) {
    if (marker.text) {
      marker.marker.openInfoWindowHtml(marker.text);
    }
    if (marker.rmt) {
      $.get(obj.vars.rmtcallback + '/' + marker.rmt, {}, function(data){
        marker.marker.openInfoWindowHtml(data);
      });
    }
    else if (marker.tabs) {
      var infoWinTabs = [];
      for (var m in marker.tabs) {
        infoWinTabs.push(new GInfoWindowTab(m,marker.tabs[m]));
      }
      marker.marker.openInfoWindowTabsHtml(infoWinTabs);
    }
    else if (marker.link) {
        open(marker.link,'_self');
    }
  });
});
