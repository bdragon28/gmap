/* $Id$ */

////////////////////////////////////////
//           Macro widget             //
////////////////////////////////////////

/**
 * Widget handler.
 */
Drupal.gmap.addHandler('macrotext', function(elem) {
  var obj = this;
  // Update macro every time something happens.
  obj.bind('all',function(){elem.value = obj.macro.call(obj)});
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

/**
 * Get the current state as a macro.
 * @@@ Make this extensible or something...
 */
Drupal.gmap.map.prototype.macro = function() {
  var o = '[gmap';

  o+=' |zoom='    + this.vars.zoom;
  o+=' |center='  + this.vars.latitude+','+this.vars.longitude;
  o+=' |width='   + this.vars.width;
  o+=' |height='  + this.vars.height;
  o+=' |id='      + this.vars.id;
  o+=' |control=' + this.vars.controltype;
  // @@@ Use maptype instead, accept old and new.
  o+=' |type='    + this.vars.maptype;

  if (this.macroparts) {
    for (var i=0; i<this.macroparts.length; i++) {
      o+= this.macroparts[i].call(this);
    }
  }

  // @@@ Wouldn't it be simpler to have an arbitrary # of lines?
  if (this.vars.line1 && this.vars.line1.length >0) o += ' |line1=' + this.vars.line1;
  if (this.vars.line2 && this.vars.line2.length >0) o += ' |line2=' + this.vars.line2;
  if (this.vars.line3 && this.vars.line3.length >0) o += ' |line3=' + this.vars.line3;

  o+= ']';
  return o;
}
