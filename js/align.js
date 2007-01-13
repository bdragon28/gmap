/* $Id$ */

/**
 * Alignment widget.
 * Applies CSS classes to a macro.
 */

////////////////////////////////////////
//           Align widget             //
////////////////////////////////////////
Drupal.gmap.prototype.handler.alignment = function(elem) {
  var obj = this;
  // Respond to incoming alignment changes.
  var binding = obj.bind("alignchange",function(){elem.value = obj.vars.align});
  // Send out outgoing alignment changes.
  $(elem).change(function() {
    obj.vars.align = elem.value;
    obj.change("alignchange",binding);
  });
}

Drupal.gmap.prototype.macroparts.push(function() {
  var obj = this;
  var output = '';
  if (obj.vars.align && obj.vars.align != 'None') {
    output .= ' |align=' + obj.vars.align;
  }
  return output;
}
    
