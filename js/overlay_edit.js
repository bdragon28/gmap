/**
 * Gmap Overlay Editor
 */

/************* Overlay edit widget ******************/
Drupal.gmap.prototype.handler.overlayedit = function(elem) {
  var obj = this;

  obj.lines = [];
  obj.lines[0] = {};
  obj.lines[0].points = []; //@@@

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
      obj.vars.pointsOverlays = new Array();
      obj.vars.points = new Array();
      // Initialize points...
      
      GEvent.addListener(obj.map, 'click', function(overlay, point) {
        if (overlay) {
          var shft=false;
          for (i=0; i<obj.vars.points.length; i++){
            if (overlay==obj.vars.pointsOverlays[i]) {
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
          obj.change('point',-1);
        }
        else if (point) {
          switch (elem.value) {
            // I've got the feeling that some of the following logic could be trimmed
            case 'Points':
              obj.map.addOverlay(marker=new GMarker(point));
              obj.vars.pointsOverlays.push(marker);
              obj.vars.points.push('' + point.lat() + ',' + point.lng());
              obj.change('point',-1);
              break;
            case 'Line1':
              obj.lines[0].points.push(point);
              if (obj.lines[0].overlay) {
                obj.map.removeOverlay(obj.lines[0].overlay);
              }
              obj.map.addOverlay(obj.lines[0].overlay = new GPolyline(obj.lines[0].points, '#000000', 5));

              break;
/*

          map.drupal.line1points.push(point);
          if (map.drupal.line1overlay) map.removeOverlay(map.drupal.line1overlay);
          map.drupal.line1overlay=new GPolyline(map.drupal.line1points, map.drupal.linecolors[0], 5);
          map.addOverlay(map.drupal.line1overlay);
          if (map.drupal.line1string.length > 0) map.drupal.line1string += ' + ';
          map.drupal.line1string += point.lat() + ',' + point.lng();
          map.drupal.gmapline1 = map.drupal.line1string;
          break;
          */

          }
        }
      });
    }
  });
}

Drupal.gmap.prototype.macroparts.push(function() {
  if (this.vars.points) {
    if (this.vars.points.length > 0) {
      return ' |markers=' + this.vars.points.join(' + ');
    }
  }
  return '';
});
