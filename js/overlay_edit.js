/**
 * Gmap Overlay Editor
 */
/* $Id$ */

Drupal.gmap.addHandler('overlayedit_mapclicktype',function(elem) {
  var obj = this;
  obj.vars.overlay_add_mode = elem.value;
  $(elem).change(function() {
    obj.vars.overlay_add_mode = elem.value;
    if (obj.temp_point) {
      delete obj.temp_point;
    }
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
    var temp, i, q;
    if (obj.vars.shapes) {
      var circles  = [];
      var lines = [];
      $.each(obj.vars.shapes,function(i,n){
        if (n.type == 'circle') {
          if (!n.style) {n.style = [];}
          circles.push(n.style.join('/') +':'+ n.center.join(' , ') +' + '+ n.radius);
        }
        else if (n.type == 'line') {
          if (!n.style) {n.style = [];}
          var tmp = [];
          $.each(n.points, function(idx,pt) {
            tmp.push(''+ pt[0] +' , '+ pt[1]);
          });
          lines.push(n.style.join('/') +':'+ tmp.join(' + '));
        }
      });
      $.each(circles, function(i,n) {
        add.push('circle='+ n);
      });
      $.each(lines, function(i,n) {
        add.push('line='+ n);
      });
    }
    if (obj.vars.points) {
      for (i in obj.vars.points) {
        if (i) {
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
    }
    for (q = 0; q<3 ; q++) {
      temp = [];
      if (obj.vars.lines && obj.vars.lines[q] && obj.vars.lines[q].points) {
        // Lines have at least 2 points.
        if (obj.vars.lines[q].points.length > 1) {
          for(i = 0; i < obj.vars.lines[q].points.length; i++) {
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
};

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
      obj.vars.pointsOverlays = [];
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
                obj.vars.points[elem.value] = [];
              }
              marker = new GMarker(point,{icon:Drupal.gmap.getIcon(elem.value,obj.vars.points[elem.value].length)});
              marker.gmapMarkerData({type: elem.value, idx: obj.vars.points[elem.value].length, point: point});
              obj.vars.points[elem.value].push(marker);
              obj.map.addOverlay(marker);
              obj.change('point',-1);
              break;
            case 'Lines':
              if (!obj.temp_point) {
                obj.temp_point = [];
                obj.temp_point.push(point);
                obj.status("Drawing line. Click for more points, double click to finish.");
              }
              else {
                obj.temp_point.push(point);
                // @@@ Add a temporary overlay here?
              }
              break;
            case 'Circles':
              if (!obj.temp_point) {
                obj.temp_point = point;
                // @@@ Translate
                obj.status("Drawing circle. Click a point on the rim to place.");
              }
              else {
                var point1 = obj.temp_point;
                delete obj.temp_point;
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
      GEvent.addListener(obj.map, 'dblclick', function(overlay, point) {
        if (overlay) {

        }
        else if (point) {
          switch (obj.vars.overlay_add_mode) {
            case 'Lines':
              obj.temp_point.pop(); // Remove the second of two click events that happens before the dblclick...
              if (obj.temp_point.length < 2) {return;} // If the user started by double clicking...
              var points = obj.temp_point;
              delete obj.temp_point;
              obj.status("Placed "+ points.length +"-segment line.");

              if (!obj.vars.shapes) {
                obj.vars.shapes = [];
              }
              var coords = [];
              $.each(points, function(i,n) {
                coords.push([n.lat(), n.lng()]);
              });
              var shape = {
                type: 'line',
                points: coords,
                style: [
                  obj.vars.overlay_stroke_color,
                  obj.vars.overlay_stroke_weight,
                  obj.vars.overlay_stroke_opacity
                ]
              };
              obj.change('prepareshape', -1, shape);
              obj.change('addshape', -1, shape);
            }
        }
      });
    }
  });
});
