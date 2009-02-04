<?php
// $Id$

/**
 * @file
 * Backwards compatibility functions for using gmap with Location 2.x.
 */

// NOTE: This hasn't actually been tested, as Location 2.x is no longer supported.

/**
 * Epsilon test.
 * Helper function for seeing if two floats are equal.  We could use other functions, but all
 * of them belong to libraries that do not come standard with PHP out of the box.
 */
function _location_floats_are_equal($x, $y) {
  $x = floatval($x);
  $y = floatval($y);
  return (abs(max($x, $y) - min($x, $y)) < pow(10, -6));
}

/*
 * Check whether a location has coordinates or not.
 *
 * @param $location The location to check.
 * @param $canonical Is this a location that is fully saved?
 *   If set to TRUE, only the source will be checked.
 */
function location_has_coordinates($location, $canonical = FALSE) {
  // Locations that have been fully saved have an up to date source.
  if ($canonical) {
    return ($location['source'] != LOCATION_LATLON_UNDEFINED);
  }

  // Otherwise, we need to do the full checks.

  // If latitude or longitude are empty / missing
  if (empty($location['latitude']) || empty($location['longitude'])) {
    return FALSE;
  }

  // If the latitude or longitude are zeroed (Although it could be a good idea to relax this slightly sometimes)
  if (_location_floats_are_equal($location['latitude'], 0.0) || _location_floats_are_equal($location['longitude'], 0.0)) {
    return FALSE;
  }

  return TRUE;
}
