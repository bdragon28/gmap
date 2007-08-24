/**
 * Gmap Overlay Editor
 */
/* $Id$ */

Drupal.gmap.addHandler('overlayedit_mapclicktype',function(elem) {
  var obj = this;
  obj.vars.overlay_add_mode = elem.value;
  $(elem).change(function() {
    obj.vars.overlay_add_mode = elem.value;
  });
});
Drupal.gmap.addHandler('overlayedit_markerclicktype',function(elem) {
  var obj = this;
  obj.vars.overlay_del_mode = elem.value;
  $(elem).change(function() {
    obj.vars.overlay_del_mode = elem.value;
  });
});
Drupal.gmap.addHandler('overlayedit_scol',function(elem) {
  var obj = this;
  obj.vars.overlay_stroke_color = '#'+elem.value;
  $(elem).change(function() {
    obj.vars.overlay_stroke_color = '#'+elem.value;
  });
});
Drupal.gmap.addHandler('overlayedit_sweight',function(elem) {
  var obj = this;
  obj.vars.overlay_stroke_weight = Number(elem.value);
  $(elem).change(function() {
    obj.vars.overlay_stroke_weight = Number(elem.value);
  });
});
Drupal.gmap.addHandler('overlayedit_sopac',function(elem) {
  var obj = this;
  obj.vars.overlay_stroke_opacity = Number(elem.value) / 100;
  $(elem).change(function() {
    obj.vars.overlay_stroke_opacity = Number(elem.value) / 100;
  });
});
Drupal.gmap.addHandler('overlayedit_fcolor',function(elem) {
  var obj = this;
  obj.vars.overlay_fill_color = '#' + elem.value;
  $(elem).change(function() {
    obj.vars.overlay_fill_color = '#'+elem.value;
  });
});
Drupal.gmap.addHandler('overlayedit_fopac',function(elem) {
  var obj = this;
  obj.vars.overlay_fill_opacity = Number(elem.value) / 100;
  $(elem).change(function() {
    obj.vars.overlay_fill_opacity = Number(elem.value) / 100;
  });
});



Drupal.gmap.addHandler('gmap',function(elem) {
  var obj = this;
  // Add status bar
  var status = $(elem).after('<div class="gmap-statusbar">Status</div>').next();
  obj.statusdiv = status[0];

  obj.bind('buildmacro',function(add) {
    var temp;
    if (obj.vars.shapes) {
      var circles  = [];
      $.each(obj.vars.shapes,function(i,n){
        if (n.type == 'circle') {
          if (!n.style) n.style = [];
          circles.push(n.style.join('/') +':'+ n.center.join(' , ') +' + '+ n.radius);
        }
      });
      $.each(circles,function(i,n) {
        add.push('circle='+n);
      });
    }
    if (obj.vars.points) {
      for (var i in obj.vars.points) {
        temp = [];
        for (var j = 0 ; j < obj.vars.points[i].length ; j++) {
          var data = obj.vars.points[i][j].gmapMarkerData();
          temp.push(''+ data.point.lat() + ',' + data.point.lng());
        }
        if (temp.length > 0) {
          add.push('markers='+i+'::' + temp.join(' + '));
        }
      }
    }
    for (var q=0; q<3 ; q++) {
      temp = [];
      if (obj.vars.lines && obj.vars.lines[q] && obj.vars.lines[q].points) {
        // Lines have at least 2 points.
        if (obj.vars.lines[q].points.length > 1) {
          for(var i=0;i<obj.vars.lines[q].points.length;i++) {
            temp[i] = '' + obj.vars.lines[q].points[i].lat() + ',' + obj.vars.lines[q].points[i].lng();
          }
          add.push('line' + (q+1) + '=' + temp.join(' + '));
        }
      }
    }
  });
});

Drupal.gmap.map.prototype.statusdiv = undefined;

Drupal.gmap.map.prototype.status = function(text) {
  var obj = this;
  if (obj.statusdiv) {
    $(obj.statusdiv).html(text);
  }
};

// Extend markers to store type info.
GMarker.prototype.gmapMarkerData = function(data) {
  if (data) {
    this._gmapdata = data;
  }
  return this._gmapdata;
}

/************* Overlay edit widget ******************/
Drupal.gmap.addHandler('overlayedit',function(elem) {
  var obj = this;

  var binding = obj.bind('overlay_edit_mode',function() {
    // @@@
  });

  $(elem).change(function() {
    obj.vars.overlay_next_icon = elem.value;
//    obj.vars.overlay_edit_mode = elem.value;
//    obj.change('overlay_edit_mode',binding);
  });

  obj.bind('init',function() {
    obj.vars.overlay_add_mode = 'Points'; //elem.value;
    obj.vars.overlay_del_mode = 'Remove';
    var edit_text_elem;

    if(obj.map) {
      obj.vars.pointsOverlays = new Array();
      obj.vars.points = {};
      
      GEvent.addListener(obj.map, 'click', function(overlay, point) {
        if (overlay) {
          switch (obj.vars.overlay_del_mode) {
            case 'Remove':
              var data = overlay.gmapMarkerData();
              obj.vars.points[data.type].splice(data.idx,1);
              obj.map.removeOverlay(overlay);
              // Shift all following markers left one in sequence.
              for (var i = data.idx ; i < obj.vars.points[data.type].length ; i++) {
                var tempdata = obj.vars.points[data.type][i].gmapMarkerData();
                obj.map.removeOverlay(obj.vars.points[data.type][i]);
                tempdata.idx--;
                var marker = new GMarker(tempdata.point,{icon:Drupal.gmap.getIcon(tempdata.type,tempdata.idx)});
                marker.gmapMarkerData(tempdata);
                obj.vars.points[data.type][i] = marker;
                obj.map.addOverlay(marker);
              }

              obj.status("Removed overlay");
              obj.change('point',-1);
              break;
            case 'Edit Info':
              break;
          }
        }
        else if (point) {
          switch (obj.vars.overlay_add_mode) {
            // I've got the feeling that some of the following logic could be trimmed
            case 'Points':
              if (!obj.vars.points[elem.value]) {
                obj.vars.points[elem.value] = new Array();
              }
              marker=new GMarker(point,{icon:Drupal.gmap.getIcon(elem.value,obj.vars.points[elem.value].length)});
              marker.gmapMarkerData({type: elem.value, idx: obj.vars.points[elem.value].length, point: point});
              obj.vars.points[elem.value].push(marker);
              obj.map.addOverlay(marker);
              obj.change('point',-1);
              break;
            case 'Line1': // @@@ Broken at the moment.
            case 'Line2':
            case 'Line3':
              var l = 0;
              if(elem.value=='Line1') l=0;
              if(elem.value=='Line2') l=1;
              if(elem.value=='Line3') l=2; // @@@ Obvious hack.
              if (!obj.vars.lines) {
                obj.vars.lines = new Array();
              }
              if (!obj.vars.lines[l]) {
                obj.vars.lines[l] = {};
              }
              if (!obj.vars.lines[l].points) {
                obj.vars.lines[l].points = new Array();
              }
              obj.vars.lines[l].points.push(point);
              if (obj.vars.lines[l].overlay) {
                obj.map.removeOverlay(obj.vars.lines[l].overlay);
              }
              obj.map.addOverlay(obj.vars.lines[l].overlay = new GPolyline(obj.vars.lines[l].points, obj.vars.line_colors[l], 5));
              obj.change('lines',-1);
              break;
            case 'Circles':
              if (!obj.temp_circle_point) {
                obj.temp_circle_point = point;
                // @@@ Translate
                obj.status("Center: x,x. Click a point on the rim to place.");
              }
              else {
                var point1 = obj.temp_circle_point;
                delete obj.temp_circle_point;
                obj.status("Placed circle. Radius was "+ point1.distanceFrom(point) / 1000 + " km.");
                if (!obj.vars.shapes) {
                  obj.vars.shapes = [];
                }
                var shape = {
                  type: 'circle',
                  center: [
                    point1.lat(),
                    point1.lng()
                  ],
                  radius: point1.distanceFrom(point) / 1000,
                  style: [
                    obj.vars.overlay_stroke_color,
                    obj.vars.overlay_stroke_weight,
                    obj.vars.overlay_stroke_opacity,
                    obj.vars.overlay_fill_color,
                    obj.vars.overlay_fill_opacity
                  ]
                };
                obj.change('prepareshape', -1, shape);
                obj.change('addshape', -1, shape);
              }
              break;
          }
        }
      });
    }
  });
});

