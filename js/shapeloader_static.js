/**
 * GMap Shape Loader
 * Static Shapes.
 * This is a simple marker loader to read markers from the map settings array.
 * Commonly used with macros.
 */
/* $Id */

// Add a gmap handler
Drupal.gmap.addHandler('gmap', function(elem) {
  var obj = this;
  var shape, i;
  if (obj.vars.shapes) {
    // Inject shapes during init.
    obj.bind('init',function() {
      for (i=0; i<obj.vars.shapes.length; i++) {
        shape = obj.vars.shapes[i];
        if (!shape.opts) shape.opts = {};
        // TODO: style props?
        // And add it.
        obj.change('prepareshape',-1,shape);
        obj.change('addshape',-1,shape);
      }
      obj.change('shapesready',-1);
    });
  }
});