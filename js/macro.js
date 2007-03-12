/* $Id$ */

////////////////////////////////////////
//           Macro widget             //
////////////////////////////////////////

/**
 * Widget handler.
 */
Drupal.gmap.addHandler('macrotext', function(elem) {
  var obj = this;
  obj.macrostorage = {};

  obj.bind("widthchange",function(w){obj.macrostorage.width = w});
  obj.bind("heightchange",function(h){obj.macrostorage.height = h});

  // Basic macros.
  obj.bind('buildmacro',function(add) {
    add.push('zoom='+obj.vars.zoom);
    add.push('center='+obj.vars.latitude+','+obj.vars.longitude);
    add.push('width='+obj.macrostorage.width);
    add.push('height='+obj.macrostorage.height);
    add.push('id='+obj.vars.id);
    add.push('control='+obj.vars.controltype);
    // @@@ Use maptype instead, accept old and new.
    add.push('type='+obj.vars.maptype);
  });


  // Update macro every time something happens.
  obj.bind('all',function(name){
    if (name != 'buildmacro') {
      var add = new Array();
      // Collect macro pieces.
      obj.change('buildmacro',-1,add);
      elem.value = '[gmap ' + add.join(' |') + ']';

      // @@@ Wouldn't it be simpler to have an arbitrary # of lines?
//      if (obj.vars.line1 && obj.vars.line1.length >0) o += ' |line1=' + obj.vars.line1;
//      if (obj.vars.line2 && obj.vars.line2.length >0) o += ' |line2=' + obj.vars.line2;
//      if (obj.vars.line3 && obj.vars.line3.length >0) o += ' |line3=' + obj.vars.line3;
    }
  });
});

/**
 * Extensible macros @@@
 */
Drupal.gmap.map.prototype.parse = function(m) {
  // Trim off outside tag
  if (m.substr(0,5)=='[gmap') {
    m = m.slice(6,-1);
  }
}