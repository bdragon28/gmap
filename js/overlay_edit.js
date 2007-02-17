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
});

Drupal.gmap.map.prototype.statusdiv = undefined;

Drupal.gmap.map.prototype.status = function(text) {
  var obj = this;
  if (obj.statusdiv) {
    $(obj.statusdiv).html(text);
  }
};


/************* Overlay edit widget ******************/
Drupal.gmap.addHandler('overlayedit',function(elem) {
  var obj = this;
  
  var sequences;
  
  if (!sequences) {
    sequences = {};
  }

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
      obj.vars.points = new Array();
      // Initialize points...
      
      //if (!edit_text_elem) {
      //  edit_text_elem = $('<textarea rows=4 cols=20 id="poopy">sdf</textarea>').appendTo('body');
      //}
      
      GEvent.addListener(obj.map, 'click', function(overlay, point) {
        if (overlay) {
          switch (obj.vars.overlay_del_mode) {
            case 'Remove':
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
              obj.status("Removed overlay");
              obj.change('point',-1);
              break;
            case 'Edit Info':
              //var dom = $('<div>What the hell</div>').appendTo('body');
              //overlay.openInfoWindowTabs(
                //[
                  //new GInfoWindowTab('View','Tesadutfuysadtfnyusadtf uisyad tfuyisad fuyit uysadt fiuytasd fuiyt iuadfuiytuiya dfuiyt st'),
                  //new GInfoWindowTab('Info','<em>Marker:</em>Unk <em>Seq:</em>Unk <br /><em>Lat:</em>' + overlay.getPoint().lat() + '<br /><em>Lon:</em>' + overlay.getPoint().lng()),
                  //new GInfoWindowTab('Edit','<textarea rows="3" cols="20">Foo</textarea>'),
                  //new GInfoWindowTab('Foo',dom[0]),
                  //new GInfoWindowTab('Edit',edit_text_elem[0])
                //],{maxWidth: 400});
              break;
          }
        }
        else if (point) {
          switch (obj.vars.overlay_add_mode) {
            // I've got the feeling that some of the following logic could be trimmed
            case 'Points':
              if (!sequences[elem.value]) {
                sequences[elem.value] = 0;
              }
              obj.map.addOverlay(marker=new GMarker(point,Drupal.gmap.getIcon(elem.value,sequences[elem.value])));
              sequences[elem.value]++;
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
                obj.status("Would place circle. "+obj.poly.distance(point1,point));
                var poly = new GPolygon(obj.poly.computeCircle(obj,point1,point),
                  obj.vars.overlay_stroke_color,
                  obj.vars.overlay_stroke_weight,
                  obj.vars.overlay_stroke_opacity,
                  obj.vars.overlay_fill_color,
                  obj.vars.overlay_fill_opacity
                );
                obj.map.addOverlay(poly);
              }
              break;
              
          }
        }
      });
    }
  });
});

Drupal.gmap.map.prototype.macroparts.push(function() {
  var temp;
  var output = '';
  if (this.vars.points) {
    if (this.vars.points.length > 0) {
      output += ' |markers=' + this.vars.points.join(' + ');
    }
  }
  for (var q=0; q<3 ; q++) {
    temp = [];
    if (this.vars.lines && this.vars.lines[q] && this.vars.lines[q].points) {
      // Lines have at least 2 points.
      if (this.vars.lines[q].points.length > 1) {
        for(var i=0;i<this.vars.lines[q].points.length;i++) {
          temp[i] = '' + this.vars.lines[q].points[i].lat() + ',' + this.vars.lines[q].points[i].lng();
        }
        output += ' |line' + (q+1) + '=' + temp.join(' + ');
      }
    }
  }
  return output;
});


