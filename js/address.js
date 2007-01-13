/* $Id$ */

/**
 * Address widget and GMap geocoder routines.
 */

////////////////////////////////////////
//             GEOCODING              //
////////////////////////////////////////

/**
 * Provide a shared geocoder.
 * Lazy initialize it so it's not resident until needed.
 */
Drupal.gmap.prototype.geocoder = function() {
  var theGeocoder;
  if (!theGeocoder) {
    theGeocoder = new GClientGeocoder();
    return theGeocoder;
  }
  else {
    return theGeocoder;
  }
}

////////////////////////////////////////
//         Address widget             //
////////////////////////////////////////

Drupal.gmap.prototype.handler.address = function(elem) {
  var obj = this;

  // Respond to focus event.
  $(elem).focus(function() {
    this.value = '';
  });

  // Respond to incoming movements.
  // Clear the box when the coords change...
  var binding = obj.bind("move",function(){elem.value = 'Enter an address'});
  // Send out outgoing movements.
  // This happens ASYNC!!!
  $(elem).change(function() {
    if(elem.value.length > 0) {
      obj.geocoder().getLatLng(elem.value,function(point) {
        if(point) {
          obj.vars.latitude = point.lat();
          obj.vars.longitude = point.lng();
          obj.change("move",binding);
        }
        else {
          // Todo: Get translated value using settings.
          elem.value = 'Geocoder error: Address not found';
        }
      });
    }
    else {
      // Was empty. Ignore.
      elem.value = 'Enter an address';
    }
  });
}

