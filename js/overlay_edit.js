/**
 * Gmap Overlay Editor
 */

/************* Overlay edit widget ******************/
Drupal.gmap.prototype.handler.overlayedit = function(elem) {
  var obj = this;

  var binding = obj.bind('overlay_edit_mode',function() {
    // @@@
  });

  $(elem).change(function() {
    obj.vars.overlay_edit_mode = elem.value;
    obj.change('overlay_edit_mode',binding);
  });

  obj.bind('init',function() {
    obj.vars.overlay_edit_mode = elem.value;

    if(obj.map) {
      obj.pointsOverlays = new Array();
      // Initialize points...
      
      GEvent.addListener(obj.map, 'click', function(overlay, point) {
        if (overlay) {
          var shft=false;
          for (i=0; i<obj.vars.points.length; i++){
            if (overlay==obj.pointsOverlays[i]) {
              shft=true;
            }
            if (shft==true) {
              if (i<obj.vars.points.length) {
                obj.vars.pointsOverlays[i]=obj.vars.pointsOverlays[i+1];
                obj.vars.points[i]=obj.vars.points[i+1];
              }
            }
          }
          obj.vars.points.pop();
          obj.vars.pointsOverlays.pop();
          obj.map.removeOverlay(overlay);
        }
        else if (point) {
          switch (elem.value) {
            // I've got the feeling that some of the following logic could be trimmed
            case 'Points':
              obj.map.addOverlay(marker=new GMarker(point));
              obj.vars.pointsOverlays.push(marker);
              obj.vars.points.push(point.lat() + ',' + point.lng());
              break;
          }
        }
      });
    }
  });
}

