/**
 * Gmap Overlay Editor
 */

/************* Overlay edit widget ******************/
Drupal.gmap.prototype.handler.overlayedit = function(elem) {
  var obj = this;

  obj.lines = [];
  obj.lines[0] = {};
  obj.lines[0].points = []; //@@@
  obj.lines[1] = {};
  obj.lines[1].points = []; //@@@
  obj.lines[2] = {};
  obj.lines[2].points = []; //@@@

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
            case 'Line2':
            case 'Line3':
              var l = 0;
              if(elem.value=='Line1') l=0;
              if(elem.value=='Line2') l=1;
              if(elem.value=='Line3') l=2; // @@@ Obvious hack.
              obj.lines[l].points.push(point);
              if (obj.lines[l].overlay) {
                obj.map.removeOverlay(obj.lines[l].overlay);
              }
              obj.map.addOverlay(obj.lines[l].overlay = new GPolyline(obj.lines[l].points, '#000000', 5));
              break;
          }
        }
      });
    }
  });
}

Drupal.gmap.prototype.macroparts.push(function() {
  var temp;
  var output = '';
  if (this.vars.points) {
    if (this.vars.points.length > 0) {
      output += ' |markers=' + this.vars.points.join(' + ');
    }
  }
  for (var q=0; q<3 ; q++) {
    temp = [];
    if (this.lines[q].points) {
      if (this.lines[q].points.length > 0) {
        for(var i=0;i<this.lines[q].points.length;i++) {
          temp[q] = '' + this.lines[q].points[i].lat() + ',' + this.lines[q].points[i].lng();
        }
        output += ' |line' + (q+1) + '=' + temp.join(' + ');
      }
    }
  }
  return output;
});
